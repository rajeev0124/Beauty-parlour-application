import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CouponDocument = Coupon & Document;

@Schema({ timestamps: true })
export class Coupon {
  @Prop({ required: true, unique: true, uppercase: true })
  code: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, enum: ['percentage', 'fixed'] })
  discountType: string;

  @Prop({ required: true })
  discountValue: number;

  @Prop()
  minOrderAmount: number;

  @Prop()
  maxDiscount: number;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ default: 0 })
  usageCount: number;

  @Prop()
  maxUsage: number;

  @Prop({ default: 1 })
  perUserLimit: number;

  @Prop({ type: [String], enum: ['service', 'product', 'all'], default: ['all'] })
  applicableOn: string[];

  @Prop({ default: true })
  isActive: boolean;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);
