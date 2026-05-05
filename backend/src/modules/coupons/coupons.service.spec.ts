import { Test, TestingModule } from '@nestjs/testing';
import { CouponsService } from './coupons.service';
import { getModelToken } from '@nestjs/mongoose';
import { Coupon } from './schemas/coupon.schema';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('CouponsService', () => {
  let service: CouponsService;
  let mockCouponModel: any;

  const mockCoupon = {
    _id: '507f1f77bcf86cd799439011',
    code: 'SAVE20',
    description: '20% off on all services',
    discountType: 'percentage',
    discountValue: 20,
    minOrderAmount: 500,
    maxDiscount: 200,
    startDate: new Date('2026-01-01'),
    endDate: new Date('2026-12-31'),
    usageCount: 5,
    maxUsage: 100,
    isActive: true,
    applicableOn: ['all'],
    save: jest.fn().mockResolvedValue(this),
  };

  beforeEach(async () => {
    mockCouponModel = jest.fn().mockImplementation((dto) => ({
      ...dto,
      save: jest.fn().mockResolvedValue({ ...mockCoupon, ...dto }),
    }));

    mockCouponModel.findOne = jest.fn();
    mockCouponModel.findById = jest.fn();
    mockCouponModel.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockCoupon]),
      }),
    });
    mockCouponModel.findByIdAndUpdate = jest.fn();
    mockCouponModel.findByIdAndDelete = jest.fn();
    mockCouponModel.findOneAndUpdate = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CouponsService,
        { provide: getModelToken(Coupon.name), useValue: mockCouponModel },
      ],
    }).compile();

    service = module.get<CouponsService>(CouponsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto = {
      code: 'NEWCODE',
      description: 'New discount',
      discountType: 'percentage' as const,
      discountValue: 15,
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
    };

    it('should create a new coupon', async () => {
      mockCouponModel.findOne.mockResolvedValue(null);

      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(mockCouponModel.findOne).toHaveBeenCalledWith({ code: 'NEWCODE' });
    });

    it('should throw BadRequestException if coupon code exists', async () => {
      mockCouponModel.findOne.mockResolvedValue(mockCoupon);

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all coupons', async () => {
      const result = await service.findAll({});

      expect(result).toEqual([mockCoupon]);
      expect(mockCouponModel.find).toHaveBeenCalled();
    });

    it('should filter active coupons', async () => {
      await service.findAll({ active: 'true' });

      expect(mockCouponModel.find).toHaveBeenCalledWith({ isActive: true });
    });
  });

  describe('findOne', () => {
    it('should return a coupon by id', async () => {
      mockCouponModel.findById.mockResolvedValue(mockCoupon);

      const result = await service.findOne('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockCoupon);
    });

    it('should throw NotFoundException if coupon not found', async () => {
      mockCouponModel.findById.mockResolvedValue(null);

      await expect(service.findOne('invalidId')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a coupon', async () => {
      mockCouponModel.findByIdAndUpdate.mockResolvedValue({
        ...mockCoupon,
        discountValue: 25,
      });

      const result = await service.update('507f1f77bcf86cd799439011', {
        discountValue: 25,
      });

      expect(result.discountValue).toBe(25);
    });

    it('should throw NotFoundException if coupon not found', async () => {
      mockCouponModel.findByIdAndUpdate.mockResolvedValue(null);

      await expect(service.update('invalidId', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should delete a coupon', async () => {
      mockCouponModel.findByIdAndDelete.mockResolvedValue(mockCoupon);

      await service.delete('507f1f77bcf86cd799439011');

      expect(mockCouponModel.findByIdAndDelete).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });
  });

  describe('validate', () => {
    it('should validate a valid coupon', async () => {
      mockCouponModel.findOne.mockResolvedValue(mockCoupon);

      const result = await service.validate({
        code: 'SAVE20',
        orderAmount: 1000,
      });

      expect(result.valid).toBe(true);
      expect(result.discount).toBe(200); // 20% of 1000, capped at maxDiscount
    });

    it('should throw BadRequestException for invalid coupon', async () => {
      mockCouponModel.findOne.mockResolvedValue(null);

      await expect(
        service.validate({ code: 'INVALID', orderAmount: 1000 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for minimum order amount', async () => {
      mockCouponModel.findOne.mockResolvedValue(mockCoupon);

      await expect(
        service.validate({ code: 'SAVE20', orderAmount: 100 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('applyCoupon', () => {
    it('should increment usage count', async () => {
      mockCouponModel.findOneAndUpdate.mockResolvedValue({
        ...mockCoupon,
        usageCount: 6,
      });

      const result = await service.applyCoupon('SAVE20');

      expect(result?.usageCount).toBe(6);
      expect(mockCouponModel.findOneAndUpdate).toHaveBeenCalledWith(
        { code: 'SAVE20' },
        { $inc: { usageCount: 1 } },
        { returnDocument: 'after' },
      );
    });
  });
});
