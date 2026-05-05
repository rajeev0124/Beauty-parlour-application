import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AppointmentDocument = Appointment & Document;

@Schema({ timestamps: true })
export class Appointment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop()
  userName: string;

  @Prop({ type: Types.ObjectId, ref: 'BeautyService', required: true })
  serviceId: Types.ObjectId;

  @Prop()
  serviceName: string;

  @Prop({ type: Types.ObjectId, ref: 'Staff' })
  staffId: Types.ObjectId;

  @Prop()
  staffName: string;

  @Prop({ required: true })
  date: string;

  @Prop({ required: true })
  time: string;

  @Prop({
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'],
    default: 'pending',
  })
  status: string;

  @Prop()
  notes: string;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);
