import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StaffDocument = Staff & Document;

@Schema({ timestamps: true })
export class Staff {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true })
  role: string;

  @Prop({ required: true })
  phone: string;

  @Prop()
  email: string;

  @Prop()
  specialization: string;

  @Prop({ default: true })
  availability: boolean;

  @Prop({ enum: ['active', 'inactive'], default: 'active' })
  status: string;
}

export const StaffSchema = SchemaFactory.createForClass(Staff);
