import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { Appointment } from '../../schemas/appointment.schema';
import { Types } from 'mongoose';

describe('AppointmentsService', () => {
  let service: AppointmentsService;
  let model: any;

  const mockAppointment = {
    _id: new Types.ObjectId().toHexString(),
    userId: new Types.ObjectId(),
    serviceId: new Types.ObjectId(),
    staffId: new Types.ObjectId(),
    date: '2024-05-20',
    time: '10:00',
    status: 'pending',
  };

  const mockAppointmentModel = {
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        {
          provide: getModelToken(Appointment.name),
          useValue: mockAppointmentModel,
        },
      ],
    }).compile();

    service = module.get<AppointmentsService>(AppointmentsService);
    model = module.get(getModelToken(Appointment.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all appointments', async () => {
      const appointments = [mockAppointment];
      model.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(appointments),
      });

      const result = await service.findAll({});
      expect(result).toEqual(appointments);
      expect(model.find).toHaveBeenCalledWith({});
    });

    it('should filter by status', async () => {
      model.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([]),
      });

      await service.findAll({ status: 'confirmed' });
      expect(model.find).toHaveBeenCalledWith({ status: 'confirmed' });
    });
  });

  describe('findById', () => {
    it('should return an appointment if found', async () => {
      model.findById.mockResolvedValue(mockAppointment);

      const result = await service.findById(mockAppointment._id);
      expect(result).toEqual(mockAppointment);
    });

    it('should throw NotFoundException if not found', async () => {
      model.findById.mockResolvedValue(null);

      await expect(service.findById('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a new appointment', async () => {
      const dto = {
        userId: new Types.ObjectId().toHexString(),
        serviceId: new Types.ObjectId().toHexString(),
        date: '2027-05-20',
        time: '10:00',
      };

      model.create.mockResolvedValue({ ...dto, status: 'pending' });

      const result = await service.create(dto as any);
      expect(result.status).toBe('pending');
      expect(model.create).toHaveBeenCalled();
    });

    it('should throw error if userId is missing', async () => {
      const dto = { serviceId: '123' };
      await expect(service.create(dto as any)).rejects.toThrow(
        'userId is required',
      );
    });
  });

  describe('updateStatus', () => {
    it('should update appointment status', async () => {
      const updated = { ...mockAppointment, status: 'confirmed' };
      model.findByIdAndUpdate.mockResolvedValue(updated);

      const result = await service.updateStatus(mockAppointment._id, {
        status: 'confirmed',
      });
      expect(result.status).toBe('confirmed');
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        mockAppointment._id,
        { status: 'confirmed' },
        { returnDocument: 'after', runValidators: true },
      );
    });
  });
});
