import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GiftCardsService } from './gift-cards.service';
import { CreateGiftCardDto, RedeemGiftCardDto, CheckBalanceDto } from './dto/gift-card.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Gift Cards')
@Controller('gift-cards')
export class GiftCardsController {
  constructor(private readonly giftCardsService: GiftCardsService) {}

  // === Public Endpoints ===

  @Post('check-balance')
  @ApiOperation({ summary: 'Check gift card balance (no auth required)' })
  async checkBalance(@Body() dto: CheckBalanceDto) {
    return this.giftCardsService.checkBalance(dto.code);
  }

  // === Customer Endpoints ===

  @Post('purchase')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Purchase a new gift card' })
  async purchase(@CurrentUser() user: any, @Body() dto: CreateGiftCardDto) {
    return this.giftCardsService.purchase(
      user._id.toString(),
      user.name,
      user.email,
      dto,
    );
  }

  @Post('redeem')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Redeem gift card balance' })
  async redeem(@Body() dto: RedeemGiftCardDto) {
    return this.giftCardsService.redeem(dto);
  }

  @Get('my-purchases')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get gift cards purchased by current user' })
  async myPurchases(@CurrentUser() user: any) {
    return this.giftCardsService.findByPurchaser(user._id.toString());
  }

  @Get('my-received')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get gift cards received by current user' })
  async myReceived(@CurrentUser() user: any) {
    return this.giftCardsService.findByRecipient(user.email);
  }

  // === Admin Endpoints ===

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all gift cards (admin)' })
  async findAll(
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.giftCardsService.findAll({
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get gift card statistics (admin)' })
  async getStats() {
    return this.giftCardsService.getStats();
  }

  @Get(':code')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get gift card by code (admin)' })
  async findByCode(@Param('code') code: string) {
    return this.giftCardsService.findByCode(code);
  }

  @Post(':code/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Cancel a gift card (admin)' })
  async cancel(@Param('code') code: string, @Body('reason') reason?: string) {
    return this.giftCardsService.cancel(code, reason);
  }

  @Post(':code/resend')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Resend gift card to recipient (admin)' })
  async resend(@Param('code') code: string) {
    return this.giftCardsService.resend(code);
  }
}
