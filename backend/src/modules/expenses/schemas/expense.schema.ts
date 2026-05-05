import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ExpenseDocument = Expense & Document;

@Schema({ timestamps: true })
export class Expense {
  @Prop({ required: true })
  title: string;

  @Prop({
    required: true,
    enum: [
      'rent',
      'utilities',
      'salary',
      'supplies',
      'equipment',
      'marketing',
      'maintenance',
      'other',
    ],
  })
  category: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  date: Date;

  @Prop()
  description: string;

  @Prop()
  vendor: string;

  @Prop()
  receiptUrl: string;

  @Prop({ enum: ['cash', 'card', 'upi', 'bank_transfer'], default: 'cash' })
  paymentMethod: string;

  @Prop({ default: false })
  isRecurring: boolean;

  @Prop({ enum: ['daily', 'weekly', 'monthly', 'yearly'] })
  recurringFrequency: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  addedBy: Types.ObjectId;

  @Prop()
  addedByName: string;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);
