import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type AttendanceDocument = Attendance & Document;

@Schema({ timestamps: true })
export class Attendance {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Staff', required: true })
  staffId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  date: string; // YYYY-MM-DD

  @Prop()
  checkInTime?: Date;

  @Prop()
  checkOutTime?: Date;

  @Prop({ 
    enum: ['present', 'absent', 'half-day', 'leave', 'holiday'],
    default: 'present' 
  })
  status: string;

  @Prop({ default: 0 })
  workingHours: number;

  @Prop({ default: 0 })
  overtimeHours: number;

  @Prop({ default: 0 })
  breakMinutes: number;

  @Prop()
  leaveType?: string; // sick, casual, annual, etc.

  @Prop()
  leaveReason?: string;

  @Prop({ default: false })
  isApproved: boolean;

  @Prop()
  approvedBy?: string;

  @Prop()
  notes?: string;

  @Prop({ 
    type: {
      latitude: { type: Number },
      longitude: { type: Number },
      address: { type: String }
    },
    required: false
  })
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);

// Index for efficient queries
AttendanceSchema.index({ staffId: 1, date: 1 }, { unique: true });
AttendanceSchema.index({ date: 1 });
AttendanceSchema.index({ status: 1 });
