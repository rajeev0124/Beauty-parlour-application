import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true })
  price: number;

  @Prop()
  originalPrice: number;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true, default: 0 })
  stock: number;

  @Prop()
  description: string;

  @Prop()
  image: string;

  @Prop({ default: 0 })
  rating: number;

  @Prop({ default: false })
  bestseller: boolean;

  @Prop({ default: true })
  isActive: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
