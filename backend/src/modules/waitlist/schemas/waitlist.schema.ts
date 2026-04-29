import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type WaitlistEntryDocument = WaitlistEntry & Document;

@Schema({ timestamps: true })
export class WaitlistEntry {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  serviceId: string;

  @Prop({ required: true })
  serviceName: string;

  @Prop({ required: true })
  preferredDate: string; // YYYY-MM-DD

  @Prop({ type: [String], default: [] })
  preferredTimeSlots: string[]; // ['09:00', '10:00', '14:00']

  @Prop()
  preferredStaffId?: string;

  @Prop({
    enum: ['waiting', 'notified', 'booked', 'expired', 'cancelled'],
    default: 'waiting',
  })
  status: string;

  @Prop()
  customerName: string;

  @Prop()
  customerEmail: string;

  @Prop()
  customerPhone?: string;

  @Prop()
  notes?: string;

  @Prop()
  notifiedAt?: Date;

  @Prop()
  expiresAt?: Date; // Auto-expire after notification

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Appointment' })
  bookedAppointmentId?: MongooseSchema.Types.ObjectId;

  @Prop({ default: 1 })
  priority: number; // Higher number = higher priority (VIP customers)
}

export const WaitlistEntrySchema = SchemaFactory.createForClass(WaitlistEntry);

// Indexes
WaitlistEntrySchema.index({ preferredDate: 1, status: 1 });
WaitlistEntrySchema.index({ userId: 1 });
WaitlistEntrySchema.index({ serviceId: 1, preferredDate: 1 });
