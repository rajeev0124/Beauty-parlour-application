import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type CampaignDocument = Campaign & Document;

@Schema({ timestamps: true })
export class Campaign {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({
    enum: ['email', 'sms', 'push', 'combined'],
    default: 'email',
  })
  type: string;

  @Prop({
    enum: ['draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled'],
    default: 'draft',
  })
  status: string;

  @Prop()
  subject: string; // Email subject

  @Prop({ required: true })
  content: string;

  @Prop()
  smsContent?: string;

  @Prop({ type: Object })
  targetAudience: {
    segment?: 'all' | 'vip' | 'new' | 'inactive' | 'custom';
    customFilter?: {
      minPurchases?: number;
      maxPurchases?: number;
      lastVisitDays?: number;
      membershipTier?: string[];
      tags?: string[];
    };
    customerIds?: string[];
  };

  @Prop()
  scheduledAt?: Date;

  @Prop()
  startedAt?: Date;

  @Prop()
  completedAt?: Date;

  @Prop({ type: Object, default: {} })
  stats: {
    totalRecipients: number;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    unsubscribed: number;
    bounced: number;
    failed: number;
  };

  @Prop()
  couponCode?: string; // Attached coupon code

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  createdBy: MongooseSchema.Types.ObjectId;

  @Prop({ default: false })
  isRecurring: boolean;

  @Prop()
  recurringSchedule?: string; // Cron expression for recurring

  @Prop()
  lastRecurringRun?: Date;
}

export const CampaignSchema = SchemaFactory.createForClass(Campaign);

// Indexes
CampaignSchema.index({ status: 1 });
CampaignSchema.index({ scheduledAt: 1 });
CampaignSchema.index({ type: 1 });
