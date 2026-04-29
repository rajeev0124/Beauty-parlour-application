import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StaffScheduleDocument = StaffSchedule & Document;

@Schema({ timestamps: true })
export class StaffSchedule {
  @Prop({ type: Types.ObjectId, ref: 'Staff', required: true })
  staff: Types.ObjectId;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  startTime: string; // Format: "HH:mm"

  @Prop({ required: true })
  endTime: string; // Format: "HH:mm"

  @Prop({ default: false })
  isLeave: boolean;

  @Prop({ enum: ['scheduled', 'working', 'completed', 'absent', 'leave'], default: 'scheduled' })
  status: string;

  @Prop()
  leaveType?: string; // sick, vacation, personal, etc.

  @Prop()
  leaveReason?: string;

  @Prop()
  notes?: string;

  @Prop({ default: false })
  isHoliday: boolean;

  @Prop()
  holidayName?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  approvedBy?: Types.ObjectId;

  @Prop()
  approvedAt?: Date;

  @Prop({
    type: [{
      breakStart: String,
      breakEnd: String,
      breakType: String, // lunch, tea, etc.
    }],
    default: [],
  })
  breaks: {
    breakStart: string;
    breakEnd: string;
    breakType: string;
  }[];

  @Prop({ default: 0 })
  totalHours: number;

  @Prop()
  checkInTime?: Date;

  @Prop()
  checkOutTime?: Date;

  @Prop({ default: false })
  isRecurring: boolean;

  @Prop({ type: Types.ObjectId, ref: 'StaffSchedule' })
  recurringParent?: Types.ObjectId;

  @Prop({
    type: {
      pattern: { type: String, enum: ['daily', 'weekly', 'monthly'] },
      daysOfWeek: [Number], // 0-6, Sunday-Saturday
      endDate: Date,
    },
  })
  recurringConfig?: {
    pattern: string;
    daysOfWeek: number[];
    endDate: Date;
  };
}

export const StaffScheduleSchema = SchemaFactory.createForClass(StaffSchedule);

// Indexes for efficient queries
StaffScheduleSchema.index({ staff: 1, date: 1 });
StaffScheduleSchema.index({ date: 1 });
StaffScheduleSchema.index({ status: 1 });

// Virtual to calculate total hours
StaffScheduleSchema.pre('save', function() {
  if (this.startTime && this.endTime) {
    const start = this.startTime.split(':').map(Number);
    const end = this.endTime.split(':').map(Number);
    const startMinutes = start[0] * 60 + start[1];
    const endMinutes = end[0] * 60 + end[1];
    
    let breakMinutes = 0;
    if (this.breaks && this.breaks.length > 0) {
      this.breaks.forEach(brk => {
        const bStart = brk.breakStart.split(':').map(Number);
        const bEnd = brk.breakEnd.split(':').map(Number);
        breakMinutes += (bEnd[0] * 60 + bEnd[1]) - (bStart[0] * 60 + bStart[1]);
      });
    }
    
    this.totalHours = Math.max(0, (endMinutes - startMinutes - breakMinutes) / 60);
  }
});
