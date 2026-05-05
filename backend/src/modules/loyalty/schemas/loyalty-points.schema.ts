import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LoyaltyPointsDocument = LoyaltyPoints & Document;

@Schema({ timestamps: true })
export class LoyaltyPoints {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  user: Types.ObjectId;

  @Prop({ default: 0 })
  totalPoints: number;

  @Prop({ default: 0 })
  availablePoints: number;

  @Prop({ default: 0 })
  redeemedPoints: number;

  @Prop({ default: 'bronze', enum: ['bronze', 'silver', 'gold', 'platinum'] })
  tier: string;

  @Prop({
    type: [
      {
        type: {
          type: String,
          enum: ['earned', 'redeemed', 'expired', 'bonus'],
        },
        points: Number,
        description: String,
        referenceType: {
          type: String,
          enum: ['appointment', 'order', 'referral', 'promotion', 'redemption'],
        },
        referenceId: { type: Types.ObjectId, required: false },
        date: { type: Date, default: Date.now },
        expiresAt: Date,
      },
    ],
  })
  history: {
    type: string;
    points: number;
    description: string;
    referenceType: string;
    referenceId?: Types.ObjectId;
    date: Date;
    expiresAt?: Date;
  }[];

  @Prop()
  lastActivityDate: Date;
}

export const LoyaltyPointsSchema = SchemaFactory.createForClass(LoyaltyPoints);

// Index for efficient queries
// Note: 'user' already has unique index from schema definition
LoyaltyPointsSchema.index({ tier: 1 });
LoyaltyPointsSchema.index({ availablePoints: -1 });
