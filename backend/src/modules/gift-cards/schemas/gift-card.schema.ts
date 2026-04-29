import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type GiftCardDocument = GiftCard & Document;

@Schema({ timestamps: true })
export class GiftCard {
  @Prop({ required: true, unique: true, uppercase: true })
  code: string; // Unique gift card code

  @Prop({ required: true })
  amount: number; // Original value

  @Prop({ required: true, default: 0 })
  balance: number; // Remaining balance

  @Prop({ type: Types.ObjectId, ref: 'User' })
  purchasedBy: Types.ObjectId; // Who bought it

  @Prop()
  purchaserName: string;

  @Prop()
  purchaserEmail: string;

  @Prop()
  recipientName: string;

  @Prop()
  recipientEmail: string;

  @Prop()
  recipientPhone: string;

  @Prop()
  personalMessage: string;

  @Prop({ default: 'active', enum: ['active', 'partially_used', 'exhausted', 'expired', 'cancelled'] })
  status: string;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: false })
  isDelivered: boolean;

  @Prop()
  deliveredAt: Date;

  @Prop({ default: 'email', enum: ['email', 'sms', 'print'] })
  deliveryMethod: string;

  @Prop({ type: [{ 
    date: Date, 
    amount: Number, 
    orderId: Types.ObjectId,
    description: String 
  }] })
  usageHistory: {
    date: Date;
    amount: number;
    orderId: Types.ObjectId;
    description: string;
  }[];

  @Prop({ type: Object })
  design: {
    template: string;
    color: string;
    image: string;
  };
}

export const GiftCardSchema = SchemaFactory.createForClass(GiftCard);

// Indexes (code index already created by unique: true in @Prop)
GiftCardSchema.index({ purchasedBy: 1 });
GiftCardSchema.index({ recipientEmail: 1 });
GiftCardSchema.index({ status: 1, expiresAt: 1 });
