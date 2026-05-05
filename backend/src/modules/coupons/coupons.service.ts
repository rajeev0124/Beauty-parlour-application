import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Coupon, CouponDocument } from './schemas/coupon.schema';
import {
  CreateCouponDto,
  UpdateCouponDto,
  ValidateCouponDto,
} from './dto/coupon.dto';

@Injectable()
export class CouponsService {
  constructor(
    @InjectModel(Coupon.name) private couponModel: Model<CouponDocument>,
  ) {}

  async create(createCouponDto: CreateCouponDto) {
    const existing = await this.couponModel.findOne({
      code: createCouponDto.code.toUpperCase(),
    });
    if (existing) throw new BadRequestException('Coupon code already exists');

    const coupon = new this.couponModel({
      ...createCouponDto,
      code: createCouponDto.code.toUpperCase(),
    });
    return coupon.save();
  }

  async findAll(query: { active?: string }) {
    const filter: any = {};
    if (query.active === 'true') filter.isActive = true;
    return this.couponModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string) {
    const coupon = await this.couponModel.findById(id);
    if (!coupon) throw new NotFoundException('Coupon not found');
    return coupon;
  }

  async update(id: string, updateCouponDto: UpdateCouponDto) {
    const coupon = await this.couponModel.findByIdAndUpdate(
      id,
      updateCouponDto,
      { returnDocument: 'after' },
    );
    if (!coupon) throw new NotFoundException('Coupon not found');
    return coupon;
  }

  async delete(id: string) {
    return this.couponModel.findByIdAndDelete(id);
  }

  async validate(validateDto: ValidateCouponDto) {
    const coupon = await this.couponModel.findOne({
      code: validateDto.code.toUpperCase(),
      isActive: true,
    });

    if (!coupon) throw new BadRequestException('Invalid coupon code');

    const now = new Date();
    if (now < new Date(coupon.startDate))
      throw new BadRequestException('Coupon not yet active');
    if (now > new Date(coupon.endDate))
      throw new BadRequestException('Coupon has expired');

    if (coupon.maxUsage && coupon.usageCount >= coupon.maxUsage) {
      throw new BadRequestException('Coupon usage limit reached');
    }

    if (
      coupon.minOrderAmount &&
      validateDto.orderAmount < coupon.minOrderAmount
    ) {
      throw new BadRequestException(
        `Minimum order amount is ₹${coupon.minOrderAmount}`,
      );
    }

    if (
      validateDto.type &&
      !coupon.applicableOn.includes('all') &&
      !coupon.applicableOn.includes(validateDto.type)
    ) {
      throw new BadRequestException(
        `Coupon not applicable on ${validateDto.type}s`,
      );
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (validateDto.orderAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }

    return {
      valid: true,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
      discount: Math.round(discount),
      finalAmount: validateDto.orderAmount - discount,
    };
  }

  async applyCoupon(code: string) {
    return this.couponModel.findOneAndUpdate(
      { code: code.toUpperCase() },
      { $inc: { usageCount: 1 } },
      { returnDocument: 'after' },
    );
  }

  async getActiveCoupons() {
    const now = new Date();
    return this.couponModel
      .find({
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
      })
      .select(
        'code description discountType discountValue minOrderAmount maxDiscount applicableOn',
      )
      .exec();
  }
}
