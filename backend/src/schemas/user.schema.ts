import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, trim: true })
  phone: string;

  @Prop({ required: true })
  password: string;

  @Prop({ enum: ['customer', 'admin', 'superadmin', 'staff'], default: 'customer' })
  role: string;

  @Prop()
  profileImage: string;

  @Prop()
  address: string;

  @Prop({ enum: ['active', 'blocked'], default: 'active' })
  status: string;

  @Prop()
  refreshToken: string;

  @Prop()
  resetPasswordToken: string;

  @Prop()
  resetPasswordExpires: Date;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Staff' }], default: [] })
  assignedStaff: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
