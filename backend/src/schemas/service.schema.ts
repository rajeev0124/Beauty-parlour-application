import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ServiceDocument = BeautyService & Document;

@Schema({ timestamps: true })
export class BeautyService {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  duration: number;

  @Prop({ default: '' })
  description: string;

  @Prop({ required: true })
  category: string;

  @Prop()
  image: string;

  @Prop({ default: false })
  popular: boolean;

  @Prop({ default: true })
  isActive: boolean;
}

export const ServiceSchema = SchemaFactory.createForClass(BeautyService);
