import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  LoyaltyPoints,
  LoyaltyPointsDocument,
} from './schemas/loyalty-points.schema';

// Points configuration
const POINTS_CONFIG = {
  // Points per rupee spent
  POINTS_PER_RUPEE: 1,
  // Minimum amount to earn points
  MIN_AMOUNT_FOR_POINTS: 100,
  // Points value (1 point = X rupees for redemption)
  POINT_VALUE: 0.25, // 1 point = ₹0.25, so 100 points = ₹25
  // Minimum points for redemption
  MIN_REDEMPTION_POINTS: 100,
  // Points expiry in days
  POINTS_EXPIRY_DAYS: 365,
  // Tier thresholds
  TIERS: {
    bronze: { min: 0, multiplier: 1, benefits: ['1x points on all services'] },
    silver: {
      min: 1000,
      multiplier: 1.25,
      benefits: ['1.25x points', '5% extra discount'],
    },
    gold: {
      min: 5000,
      multiplier: 1.5,
      benefits: ['1.5x points', '10% extra discount', 'Priority booking'],
    },
    platinum: {
      min: 10000,
      multiplier: 2,
      benefits: [
        '2x points',
        '15% extra discount',
        'Priority booking',
        'Free birthday service',
      ],
    },
  },
  // Bonus points
  REFERRAL_BONUS: 200,
  BIRTHDAY_BONUS: 100,
  FIRST_APPOINTMENT_BONUS: 50,
};

@Injectable()
export class LoyaltyService {
  private readonly logger = new Logger(LoyaltyService.name);

  constructor(
    @InjectModel(LoyaltyPoints.name)
    private loyaltyModel: Model<LoyaltyPointsDocument>,
  ) {}

  async getOrCreateLoyaltyAccount(
    userId: string,
  ): Promise<LoyaltyPointsDocument> {
    let account = await this.loyaltyModel.findOne({
      user: new Types.ObjectId(userId),
    });

    if (!account) {
      account = await this.loyaltyModel.create({
        user: new Types.ObjectId(userId),
        totalPoints: 0,
        availablePoints: 0,
        redeemedPoints: 0,
        tier: 'bronze',
        history: [],
      });
    }

    return account;
  }

  async getLoyaltyAccount(userId: string): Promise<any> {
    const account = await this.getOrCreateLoyaltyAccount(userId);
    const tierInfo = POINTS_CONFIG.TIERS[account.tier];
    const nextTier = this.getNextTier(account.tier);

    return {
      ...account.toObject(),
      tierInfo: {
        name: account.tier,
        multiplier: tierInfo.multiplier,
        benefits: tierInfo.benefits,
      },
      nextTier: nextTier
        ? {
            name: nextTier.name,
            pointsNeeded: nextTier.threshold - account.totalPoints,
            threshold: nextTier.threshold,
          }
        : null,
      pointValue: POINTS_CONFIG.POINT_VALUE,
      redeemableValue: account.availablePoints * POINTS_CONFIG.POINT_VALUE,
    };
  }

  private getNextTier(
    currentTier: string,
  ): { name: string; threshold: number } | null {
    const tierOrder = ['bronze', 'silver', 'gold', 'platinum'];
    const currentIndex = tierOrder.indexOf(currentTier);

    if (currentIndex < tierOrder.length - 1) {
      const nextTierName = tierOrder[currentIndex + 1];
      return {
        name: nextTierName,
        threshold: POINTS_CONFIG.TIERS[nextTierName].min,
      };
    }

    return null;
  }

  private calculateTier(totalPoints: number): string {
    if (totalPoints >= POINTS_CONFIG.TIERS.platinum.min) return 'platinum';
    if (totalPoints >= POINTS_CONFIG.TIERS.gold.min) return 'gold';
    if (totalPoints >= POINTS_CONFIG.TIERS.silver.min) return 'silver';
    return 'bronze';
  }

  async earnPoints(
    userId: string,
    amount: number,
    referenceType: string,
    referenceId: string,
    description: string,
  ): Promise<{ pointsEarned: number; account: LoyaltyPointsDocument }> {
    if (amount < POINTS_CONFIG.MIN_AMOUNT_FOR_POINTS) {
      return {
        pointsEarned: 0,
        account: await this.getOrCreateLoyaltyAccount(userId),
      };
    }

    const account = await this.getOrCreateLoyaltyAccount(userId);
    const tierMultiplier = POINTS_CONFIG.TIERS[account.tier].multiplier;
    const basePoints = Math.floor(amount * POINTS_CONFIG.POINTS_PER_RUPEE);
    const pointsEarned = Math.floor(basePoints * tierMultiplier);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + POINTS_CONFIG.POINTS_EXPIRY_DAYS);

    account.history.push({
      type: 'earned',
      points: pointsEarned,
      description,
      referenceType,
      referenceId: new Types.ObjectId(referenceId),
      date: new Date(),
      expiresAt,
    });

    account.totalPoints += pointsEarned;
    account.availablePoints += pointsEarned;
    account.lastActivityDate = new Date();
    account.tier = this.calculateTier(account.totalPoints);

    await account.save();

    this.logger.log(
      `User ${userId} earned ${pointsEarned} points for ${referenceType}`,
    );

    return { pointsEarned, account };
  }

  async addBonusPoints(
    userId: string,
    points: number,
    bonusType: string,
    description: string,
    referenceId?: string,
  ): Promise<LoyaltyPointsDocument> {
    const account = await this.getOrCreateLoyaltyAccount(userId);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + POINTS_CONFIG.POINTS_EXPIRY_DAYS);

    account.history.push({
      type: 'bonus',
      points,
      description,
      referenceType: bonusType,
      referenceId: referenceId ? new Types.ObjectId(referenceId) : undefined,
      date: new Date(),
      expiresAt,
    });

    account.totalPoints += points;
    account.availablePoints += points;
    account.lastActivityDate = new Date();
    account.tier = this.calculateTier(account.totalPoints);

    await account.save();

    this.logger.log(
      `User ${userId} received ${points} bonus points for ${bonusType}`,
    );

    return account;
  }

  async redeemPoints(
    userId: string,
    points: number,
    referenceType: string,
    referenceId: string,
    description: string,
  ): Promise<{
    redeemed: boolean;
    discountAmount: number;
    account: LoyaltyPointsDocument;
  }> {
    const account = await this.getOrCreateLoyaltyAccount(userId);

    if (points < POINTS_CONFIG.MIN_REDEMPTION_POINTS) {
      throw new BadRequestException(
        `Minimum ${POINTS_CONFIG.MIN_REDEMPTION_POINTS} points required for redemption`,
      );
    }

    if (account.availablePoints < points) {
      throw new BadRequestException('Insufficient points');
    }

    const discountAmount = points * POINTS_CONFIG.POINT_VALUE;

    account.history.push({
      type: 'redeemed',
      points: -points,
      description,
      referenceType: 'redemption',
      referenceId: new Types.ObjectId(referenceId),
      date: new Date(),
    });

    account.availablePoints -= points;
    account.redeemedPoints += points;
    account.lastActivityDate = new Date();

    await account.save();

    this.logger.log(
      `User ${userId} redeemed ${points} points for ₹${discountAmount} discount`,
    );

    return { redeemed: true, discountAmount, account };
  }

  async getPointsHistory(userId: string, limit = 50): Promise<any[]> {
    const account = await this.getOrCreateLoyaltyAccount(userId);
    return account.history
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }

  async processReferral(
    referrerId: string,
    referredUserId: string,
  ): Promise<void> {
    // Give bonus to referrer
    await this.addBonusPoints(
      referrerId,
      POINTS_CONFIG.REFERRAL_BONUS,
      'referral',
      `Referral bonus for inviting a new customer`,
      referredUserId,
    );

    // Give bonus to new user
    await this.addBonusPoints(
      referredUserId,
      Math.floor(POINTS_CONFIG.REFERRAL_BONUS / 2),
      'referral',
      'Welcome bonus for joining via referral',
      referrerId,
    );
  }

  async processFirstAppointmentBonus(userId: string): Promise<void> {
    await this.addBonusPoints(
      userId,
      POINTS_CONFIG.FIRST_APPOINTMENT_BONUS,
      'promotion',
      'First appointment completion bonus',
    );
  }

  async getLeaderboard(limit = 10): Promise<any[]> {
    return this.loyaltyModel
      .find()
      .sort({ totalPoints: -1 })
      .limit(limit)
      .populate('user', 'name email')
      .select('user totalPoints tier')
      .exec();
  }

  async getConfig(): Promise<typeof POINTS_CONFIG> {
    return POINTS_CONFIG;
  }
}
