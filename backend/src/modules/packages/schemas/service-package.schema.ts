import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ServicePackageDocument = ServicePackage & Document;

@Schema({ timestamps: true })
export class ServicePackage {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ type: [{ 
    service: { type: Types.ObjectId, ref: 'Service' },
    quantity: { type: Number, default: 1 }
  }], required: true })
  services: {
    service: Types.ObjectId;
    quantity: number;
  }[];

  @Prop({ required: true })
  originalPrice: number;

  @Prop({ required: true })
  packagePrice: number;

  @Prop()
  discountPercentage: number;

  @Prop({ default: 0 })
  savingsAmount: number;

  @Prop()
  validityDays: number; // How many days package is valid after purchase

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  imageUrl: string;

  @Prop({ default: 'standard', enum: ['standard', 'premium', 'bridal', 'seasonal'] })
  category: string;

  @Prop({ type: [String] })
  tags: string[];

  @Prop()
  termsAndConditions: string;

  @Prop({ default: 0 })
  maxRedemptions: number; // 0 = unlimited

  @Prop({ default: 0 })
  currentRedemptions: number;

  @Prop()
  startDate: Date;

  @Prop()
  endDate: Date;

  @Prop({ default: 0 })
  sortOrder: number;
}

export const ServicePackageSchema = SchemaFactory.createForClass(ServicePackage);

ServicePackageSchema.index({ isActive: 1, category: 1 });
ServicePackageSchema.index({ packagePrice: 1 });
