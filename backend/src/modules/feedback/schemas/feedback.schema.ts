import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FeedbackDocument = Feedback & Document;

@Schema({ timestamps: true })
export class Feedback {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop()
  userName: string;

  @Prop()
  userEmail: string;

  @Prop({ required: true, enum: ['appointment', 'order', 'general', 'service', 'staff'] })
  type: string;

  @Prop({ type: Types.ObjectId })
  referenceId: Types.ObjectId; // appointmentId or orderId

  @Prop({ type: Types.ObjectId, ref: 'Service' })
  serviceId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Staff' })
  staffId: Types.ObjectId;

  @Prop()
  staffName: string;

  // Overall Rating (1-5)
  @Prop({ required: true, min: 1, max: 5 })
  overallRating: number;

  // Detailed Ratings
  @Prop({ type: Object })
  ratings: {
    serviceQuality?: number;    // 1-5
    staffBehavior?: number;     // 1-5
    cleanliness?: number;       // 1-5
    valueForMoney?: number;     // 1-5
    waitTime?: number;          // 1-5
    ambience?: number;          // 1-5
  };

  @Prop()
  comment: string;

  @Prop({ type: [String] })
  tags: string[]; // ['great-service', 'long-wait', 'friendly-staff']

  @Prop({ type: [String] })
  images: string[]; // Customer uploaded images

  @Prop({ default: false })
  isAnonymous: boolean;

  @Prop({ default: 'pending', enum: ['pending', 'reviewed', 'responded', 'resolved'] })
  status: string;

  @Prop()
  adminResponse: string;

  @Prop()
  respondedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  respondedBy: Types.ObjectId;

  @Prop({ default: false })
  isHighlighted: boolean; // Featured review

  @Prop({ default: true })
  isPublic: boolean;

  @Prop({ type: Object })
  sentiment: {
    score: number;      // -1 to 1 (negative to positive)
    label: string;      // 'positive', 'neutral', 'negative'
    keywords: string[]; // extracted keywords
  };

  @Prop({ default: 0 })
  helpfulCount: number;

  @Prop({ type: [Types.ObjectId], ref: 'User' })
  helpfulBy: Types.ObjectId[];
}

export const FeedbackSchema = SchemaFactory.createForClass(Feedback);

// Indexes
FeedbackSchema.index({ userId: 1, createdAt: -1 });
FeedbackSchema.index({ type: 1, status: 1 });
FeedbackSchema.index({ staffId: 1, overallRating: 1 });
FeedbackSchema.index({ serviceId: 1 });
FeedbackSchema.index({ overallRating: 1 });
FeedbackSchema.index({ isPublic: 1, isHighlighted: 1 });
