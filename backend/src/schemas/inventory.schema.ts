import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InventoryDocument = Inventory & Document;

@Schema({ timestamps: true })
export class Inventory {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true, unique: true })
  productId: Types.ObjectId;

  @Prop({ required: true, default: 0 })
  stock: number;

  @Prop()
  lastRestockedAt: Date;
}

export const InventorySchema = SchemaFactory.createForClass(Inventory);
