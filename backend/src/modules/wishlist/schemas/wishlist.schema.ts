import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WishlistDocument = Wishlist & Document;

@Schema({ timestamps: true })
export class Wishlist {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({
    type: [{
      itemType: { type: String, enum: ['product', 'service', 'package'], required: true },
      item: { type: Types.ObjectId, refPath: 'items.itemRef', required: true },
      itemRef: { type: String, required: true },
      addedAt: { type: Date, default: Date.now },
      notes: String,
      priceAtAdd: Number,
      notifyOnSale: { type: Boolean, default: false },
    }],
    default: [],
  })
  items: {
    itemType: string;
    item: Types.ObjectId;
    itemRef: string;
    addedAt: Date;
    notes?: string;
    priceAtAdd?: number;
    notifyOnSale?: boolean;
  }[];

  @Prop({ default: false })
  isPublic: boolean;

  @Prop()
  shareToken?: string;

  @Prop({ default: 'My Wishlist' })
  name: string;
}

export const WishlistSchema = SchemaFactory.createForClass(Wishlist);

// Index for efficient queries
WishlistSchema.index({ user: 1 });
WishlistSchema.index({ shareToken: 1 });
WishlistSchema.index({ 'items.item': 1 });
