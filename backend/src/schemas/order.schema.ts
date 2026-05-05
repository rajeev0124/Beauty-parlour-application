import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema()
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop()
  productName: string;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true })
  price: number;
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({ timestamps: true })
export class OrderStatusUpdate {
  @Prop({ required: true })
  status: string;

  @Prop()
  timestamp: Date;

  @Prop()
  notes: string;
}

export const OrderStatusUpdateSchema = SchemaFactory.createForClass(OrderStatusUpdate);

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop()
  userName: string;

  @Prop({ type: [OrderItemSchema], required: true })
  items: OrderItem[];

  @Prop({ required: true })
  totalPrice: number;

  @Prop({
    enum: ['pending', 'processing', 'completed', 'cancelled'],
    default: 'pending',
  })
  status: string;

  @Prop({ type: [OrderStatusUpdateSchema], default: [] })
  statusHistory: OrderStatusUpdate[];

  @Prop()
  trackingNumber: string;

  @Prop()
  estimatedDeliveryDate: Date;

  @Prop()
  deliveryAddress: string;

  @Prop()
  shippingMethod: string;

  @Prop()
  notes: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
