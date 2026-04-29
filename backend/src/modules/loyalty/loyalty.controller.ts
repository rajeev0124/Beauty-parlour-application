import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { LoyaltyService } from './loyalty.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('loyalty')
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  @Get('config')
  async getConfig() {
    return this.loyaltyService.getConfig();
  }

  @Get('account')
  @UseGuards(JwtAuthGuard)
  async getMyAccount(@Request() req) {
    return this.loyaltyService.getLoyaltyAccount(req.user._id.toString());
  }

  @Get('account/:userId')
  @UseGuards(JwtAuthGuard)
  async getAccountByUserId(@Param('userId') userId: string) {
    return this.loyaltyService.getLoyaltyAccount(userId);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  async getMyHistory(@Request() req, @Query('limit') limit?: number) {
    return this.loyaltyService.getPointsHistory(req.user._id.toString(), limit || 50);
  }

  @Post('redeem')
  @UseGuards(JwtAuthGuard)
  async redeemPoints(
    @Request() req,
    @Body() body: { points: number; referenceType: string; referenceId: string; description?: string },
  ) {
    return this.loyaltyService.redeemPoints(
      req.user._id.toString(),
      body.points,
      body.referenceType,
      body.referenceId,
      body.description || 'Points redemption',
    );
  }

  @Post('earn')
  @UseGuards(JwtAuthGuard)
  async earnPoints(
    @Body() body: {
      userId: string;
      amount: number;
      referenceType: string;
      referenceId: string;
      description?: string;
    },
  ) {
    return this.loyaltyService.earnPoints(
      body.userId,
      body.amount,
      body.referenceType,
      body.referenceId,
      body.description || 'Points earned',
    );
  }

  @Post('bonus')
  @UseGuards(JwtAuthGuard)
  async addBonus(
    @Body() body: {
      userId: string;
      points: number;
      bonusType: string;
      description: string;
      referenceId?: string;
    },
  ) {
    return this.loyaltyService.addBonusPoints(
      body.userId,
      body.points,
      body.bonusType,
      body.description,
      body.referenceId,
    );
  }

  @Post('referral')
  @UseGuards(JwtAuthGuard)
  async processReferral(
    @Body() body: { referrerId: string; referredUserId: string },
  ) {
    await this.loyaltyService.processReferral(body.referrerId, body.referredUserId);
    return { success: true, message: 'Referral bonus processed' };
  }

  @Get('leaderboard')
  async getLeaderboard(@Query('limit') limit?: number) {
    return this.loyaltyService.getLeaderboard(limit || 10);
  }
}
