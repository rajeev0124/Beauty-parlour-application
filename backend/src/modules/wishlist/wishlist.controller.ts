import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import {
  AddToWishlistDto,
  UpdateWishlistDto,
  UpdateWishlistItemDto,
} from './dto/wishlist.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  getWishlist(@Req() req: any) {
    return this.wishlistService.getWishlist(req.user._id);
  }

  @Get('count')
  getWishlistCount(@Req() req: any) {
    return this.wishlistService.getWishlistCount(req.user._id);
  }

  @Get('on-sale')
  getItemsOnSale(@Req() req: any) {
    return this.wishlistService.getItemsOnSale(req.user._id);
  }

  @Get('check/:itemId')
  isInWishlist(@Req() req: any, @Param('itemId') itemId: string) {
    return this.wishlistService.isInWishlist(req.user._id, itemId);
  }

  @Get('shared/:shareToken')
  getSharedWishlist(@Param('shareToken') shareToken: string) {
    return this.wishlistService.getSharedWishlist(shareToken);
  }

  @Post('add')
  addItem(@Req() req: any, @Body() addDto: AddToWishlistDto) {
    return this.wishlistService.addItem(req.user._id, addDto);
  }

  @Delete('remove/:itemId')
  removeItem(@Req() req: any, @Param('itemId') itemId: string) {
    return this.wishlistService.removeItem(req.user._id, itemId);
  }

  @Put('item')
  updateItem(@Req() req: any, @Body() updateDto: UpdateWishlistItemDto) {
    return this.wishlistService.updateItem(req.user._id, updateDto);
  }

  @Put()
  updateWishlist(@Req() req: any, @Body() updateDto: UpdateWishlistDto) {
    return this.wishlistService.updateWishlist(req.user._id, updateDto);
  }

  @Delete('clear')
  clearWishlist(@Req() req: any) {
    return this.wishlistService.clearWishlist(req.user._id);
  }

  @Post('move-to-cart/:itemId')
  moveToCart(@Req() req: any, @Param('itemId') itemId: string) {
    return this.wishlistService.moveToCart(req.user._id, itemId);
  }
}
