import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Wishlist, WishlistDocument } from './schemas/wishlist.schema';
import { AddToWishlistDto, UpdateWishlistDto, UpdateWishlistItemDto } from './dto/wishlist.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class WishlistService {
  constructor(
    @InjectModel(Wishlist.name)
    private wishlistModel: Model<WishlistDocument>,
  ) {}

  private getItemRef(itemType: string): string {
    switch (itemType) {
      case 'product':
        return 'Product';
      case 'service':
        return 'Service';
      case 'package':
        return 'ServicePackage';
      default:
        throw new BadRequestException('Invalid item type');
    }
  }

  async getOrCreateWishlist(userId: string): Promise<WishlistDocument> {
    let wishlist = await this.wishlistModel.findOne({ user: new Types.ObjectId(userId) });

    if (!wishlist) {
      wishlist = await this.wishlistModel.create({
        user: new Types.ObjectId(userId),
        items: [],
      });
    }

    return wishlist;
  }

  async getWishlist(userId: string): Promise<WishlistDocument | null> {
    const wishlist = await this.wishlistModel
      .findOne({ user: new Types.ObjectId(userId) })
      .populate({
        path: 'items.item',
        select: 'name description price imageUrl images isActive',
      })
      .exec();

    if (!wishlist) {
      return this.getOrCreateWishlist(userId);
    }

    return wishlist;
  }

  async addItem(userId: string, addDto: AddToWishlistDto): Promise<WishlistDocument> {
    const wishlist = await this.getOrCreateWishlist(userId);

    // Check if item already exists
    const existingItem = wishlist.items.find(
      (item) => item.item.toString() === addDto.itemId && item.itemType === addDto.itemType
    );

    if (existingItem) {
      throw new ConflictException('Item already in wishlist');
    }

    wishlist.items.push({
      itemType: addDto.itemType,
      item: new Types.ObjectId(addDto.itemId),
      itemRef: this.getItemRef(addDto.itemType),
      addedAt: new Date(),
      notes: addDto.notes,
      priceAtAdd: addDto.priceAtAdd,
      notifyOnSale: addDto.notifyOnSale ?? false,
    });

    await wishlist.save();

    const updated = await this.getWishlist(userId);
    return updated!;
  }

  async removeItem(userId: string, itemId: string): Promise<WishlistDocument> {
    const wishlist = await this.wishlistModel.findOne({ user: new Types.ObjectId(userId) });

    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }

    const initialLength = wishlist.items.length;
    wishlist.items = wishlist.items.filter(
      (item) => item.item.toString() !== itemId
    );

    if (wishlist.items.length === initialLength) {
      throw new NotFoundException('Item not found in wishlist');
    }

    await wishlist.save();

    const updated = await this.getWishlist(userId);
    return updated!;
  }

  async updateItem(userId: string, updateDto: UpdateWishlistItemDto): Promise<WishlistDocument> {
    const wishlist = await this.wishlistModel.findOne({ user: new Types.ObjectId(userId) });

    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }

    const item = wishlist.items.find(
      (item) => item.item.toString() === updateDto.itemId
    );

    if (!item) {
      throw new NotFoundException('Item not found in wishlist');
    }

    if (updateDto.notes !== undefined) {
      item.notes = updateDto.notes;
    }
    if (updateDto.notifyOnSale !== undefined) {
      item.notifyOnSale = updateDto.notifyOnSale;
    }

    await wishlist.save();

    const updated = await this.getWishlist(userId);
    return updated!;
  }

  async updateWishlist(userId: string, updateDto: UpdateWishlistDto): Promise<WishlistDocument> {
    const wishlist = await this.wishlistModel.findOne({ user: new Types.ObjectId(userId) });

    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }

    if (updateDto.name !== undefined) {
      wishlist.name = updateDto.name;
    }
    if (updateDto.isPublic !== undefined) {
      wishlist.isPublic = updateDto.isPublic;
      
      // Generate share token if making public
      if (updateDto.isPublic && !wishlist.shareToken) {
        wishlist.shareToken = randomBytes(16).toString('hex');
      }
    }

    await wishlist.save();

    return wishlist;
  }

  async clearWishlist(userId: string): Promise<Wishlist> {
    const wishlist = await this.wishlistModel.findOne({ user: new Types.ObjectId(userId) });

    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }

    wishlist.items = [];
    await wishlist.save();

    return wishlist;
  }

  async getSharedWishlist(shareToken: string): Promise<Wishlist> {
    const wishlist = await this.wishlistModel
      .findOne({ shareToken, isPublic: true })
      .populate({
        path: 'items.item',
        select: 'name description price imageUrl images isActive',
      })
      .exec();

    if (!wishlist) {
      throw new NotFoundException('Wishlist not found or not public');
    }

    return wishlist;
  }

  async isInWishlist(userId: string, itemId: string): Promise<boolean> {
    const wishlist = await this.wishlistModel.findOne({
      user: new Types.ObjectId(userId),
      'items.item': new Types.ObjectId(itemId),
    });

    return !!wishlist;
  }

  async getWishlistCount(userId: string): Promise<number> {
    const wishlist = await this.wishlistModel.findOne({ user: new Types.ObjectId(userId) });
    return wishlist?.items.length ?? 0;
  }

  async moveToCart(userId: string, itemId: string): Promise<{
    itemType: string;
    item: any;
  }> {
    const wishlist = await this.wishlistModel
      .findOne({ user: new Types.ObjectId(userId) })
      .populate('items.item')
      .exec();

    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }

    const item = wishlist.items.find((i) => i.item['_id'].toString() === itemId);

    if (!item) {
      throw new NotFoundException('Item not found in wishlist');
    }

    // Remove from wishlist
    wishlist.items = wishlist.items.filter((i) => i.item['_id'].toString() !== itemId);
    await wishlist.save();

    // Return item info for cart addition
    return {
      itemType: item.itemType,
      item: item.item,
    };
  }

  async getItemsOnSale(userId: string): Promise<any[]> {
    const wishlist = await this.getWishlist(userId);
    if (!wishlist) return [];
    
    // Filter items that have price drops
    return wishlist.items.filter(item => {
      if (!item.priceAtAdd || !item.item) return false;
      const currentPrice = item.item['price'] || item.item['packagePrice'];
      return currentPrice && currentPrice < item.priceAtAdd;
    }).map(item => ({
      ...item,
      currentPrice: item.item['price'] || item.item['packagePrice'],
      priceDrop: (item.priceAtAdd ?? 0) - (item.item['price'] || item.item['packagePrice']),
    }));
  }

  async getUsersForSaleNotification(itemId: string, newPrice: number): Promise<string[]> {
    const wishlists = await this.wishlistModel.find({
      'items.item': new Types.ObjectId(itemId),
      'items.notifyOnSale': true,
    }).exec();

    return wishlists
      .filter(wishlist => {
        const item = wishlist.items.find(i => i.item.toString() === itemId);
        return item && item.priceAtAdd && newPrice < item.priceAtAdd;
      })
      .map(wishlist => wishlist.user.toString());
  }
}
