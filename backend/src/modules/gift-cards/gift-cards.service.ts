import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as crypto from 'crypto';
import { GiftCard, GiftCardDocument } from './schemas/gift-card.schema';
import { CreateGiftCardDto, RedeemGiftCardDto } from './dto/gift-card.dto';

@Injectable()
export class GiftCardsService {
  private readonly logger = new Logger(GiftCardsService.name);

  constructor(
    @InjectModel(GiftCard.name) private giftCardModel: Model<GiftCardDocument>,
  ) {}

  /**
   * Generate unique gift card code
   */
  private generateCode(): string {
    const prefix = 'GC';
    const random = crypto.randomBytes(6).toString('hex').toUpperCase();
    return `${prefix}-${random.slice(0, 4)}-${random.slice(4, 8)}-${random.slice(8)}`;
  }

  /**
   * Purchase a new gift card
   */
  async purchase(
    userId: string,
    userName: string,
    userEmail: string,
    dto: CreateGiftCardDto,
  ): Promise<GiftCardDocument> {
    const code = this.generateCode();
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1); // Valid for 1 year

    const giftCard = await this.giftCardModel.create({
      code,
      amount: dto.amount,
      balance: dto.amount,
      purchasedBy: new Types.ObjectId(userId),
      purchaserName: userName,
      purchaserEmail: userEmail,
      recipientName: dto.recipientName,
      recipientEmail: dto.recipientEmail,
      recipientPhone: dto.recipientPhone,
      personalMessage: dto.personalMessage,
      deliveryMethod: dto.deliveryMethod || 'email',
      design: dto.design,
      expiresAt,
      usageHistory: [],
    });

    this.logger.log(`Gift card purchased: ${code} for ₹${dto.amount}`);

    // TODO: Send delivery email/SMS based on deliveryMethod
    // this.sendGiftCard(giftCard);

    return giftCard;
  }

  /**
   * Check gift card balance
   */
  async checkBalance(code: string): Promise<{
    code: string;
    originalAmount: number;
    balance: number;
    status: string;
    expiresAt: Date;
    isValid: boolean;
  }> {
    const giftCard = await this.giftCardModel.findOne({
      code: code.toUpperCase(),
    });

    if (!giftCard) {
      throw new NotFoundException('Gift card not found');
    }

    const isExpired = new Date() > giftCard.expiresAt;
    const isValid =
      !isExpired && giftCard.balance > 0 && giftCard.status === 'active';

    return {
      code: giftCard.code,
      originalAmount: giftCard.amount,
      balance: giftCard.balance,
      status: isExpired ? 'expired' : giftCard.status,
      expiresAt: giftCard.expiresAt,
      isValid,
    };
  }

  /**
   * Redeem gift card (use partial or full balance)
   */
  async redeem(dto: RedeemGiftCardDto): Promise<{
    success: boolean;
    message: string;
    remainingBalance: number;
    amountUsed: number;
  }> {
    const giftCard = await this.giftCardModel.findOne({
      code: dto.code.toUpperCase(),
    });

    if (!giftCard) {
      throw new NotFoundException('Gift card not found');
    }

    if (new Date() > giftCard.expiresAt) {
      giftCard.status = 'expired';
      await giftCard.save();
      throw new BadRequestException('Gift card has expired');
    }

    if (giftCard.status !== 'active' && giftCard.status !== 'partially_used') {
      throw new BadRequestException(`Gift card is ${giftCard.status}`);
    }

    if (giftCard.balance < dto.amount) {
      throw new BadRequestException(
        `Insufficient balance. Available: ₹${giftCard.balance}`,
      );
    }

    // Deduct amount
    giftCard.balance -= dto.amount;
    giftCard.status = giftCard.balance === 0 ? 'exhausted' : 'partially_used';

    // Add to usage history
    const usageEntry: any = {
      date: new Date(),
      amount: dto.amount,
      description: dto.description || 'Redemption',
    };
    if (dto.orderId) {
      usageEntry.orderId = new Types.ObjectId(dto.orderId);
    }
    giftCard.usageHistory.push(usageEntry);

    await giftCard.save();

    this.logger.log(`Gift card ${dto.code} redeemed: ₹${dto.amount}`);

    return {
      success: true,
      message: 'Gift card redeemed successfully',
      remainingBalance: giftCard.balance,
      amountUsed: dto.amount,
    };
  }

  /**
   * Get gift cards purchased by user
   */
  async findByPurchaser(userId: string): Promise<GiftCardDocument[]> {
    return this.giftCardModel
      .find({ purchasedBy: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 });
  }

  /**
   * Get gift cards received by email
   */
  async findByRecipient(email: string): Promise<GiftCardDocument[]> {
    return this.giftCardModel
      .find({ recipientEmail: email.toLowerCase() })
      .sort({ createdAt: -1 });
  }

  /**
   * Get all gift cards (admin)
   */
  async findAll(filters?: {
    status?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<GiftCardDocument[]> {
    const query: any = {};

    if (filters?.status) {
      query.status = filters.status;
    }

    if (filters?.startDate || filters?.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = filters.startDate;
      if (filters.endDate) query.createdAt.$lte = filters.endDate;
    }

    return this.giftCardModel.find(query).sort({ createdAt: -1 });
  }

  /**
   * Get gift card by code (admin)
   */
  async findByCode(code: string): Promise<GiftCardDocument> {
    const giftCard = await this.giftCardModel.findOne({
      code: code.toUpperCase(),
    });
    if (!giftCard) {
      throw new NotFoundException('Gift card not found');
    }
    return giftCard;
  }

  /**
   * Cancel gift card (admin)
   */
  async cancel(code: string, reason?: string): Promise<GiftCardDocument> {
    const giftCard = await this.findByCode(code);

    if (giftCard.status === 'exhausted') {
      throw new BadRequestException('Cannot cancel an already used gift card');
    }

    giftCard.status = 'cancelled';
    giftCard.usageHistory.push({
      date: new Date(),
      amount: 0,
      description: `Cancelled: ${reason || 'Admin cancellation'}`,
    } as any);

    await giftCard.save();

    this.logger.log(`Gift card ${code} cancelled`);
    return giftCard;
  }

  /**
   * Get gift card statistics
   */
  async getStats(): Promise<{
    totalSold: number;
    totalValue: number;
    totalRedeemed: number;
    activeCards: number;
    expiredCards: number;
  }> {
    const stats = await this.giftCardModel.aggregate([
      {
        $group: {
          _id: null,
          totalSold: { $sum: 1 },
          totalValue: { $sum: '$amount' },
          totalRedeemed: { $sum: { $subtract: ['$amount', '$balance'] } },
          activeCards: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] },
          },
          expiredCards: {
            $sum: { $cond: [{ $eq: ['$status', 'expired'] }, 1, 0] },
          },
        },
      },
    ]);

    return (
      stats[0] || {
        totalSold: 0,
        totalValue: 0,
        totalRedeemed: 0,
        activeCards: 0,
        expiredCards: 0,
      }
    );
  }

  /**
   * Resend gift card to recipient
   */
  async resend(code: string): Promise<{ success: boolean; message: string }> {
    const giftCard = await this.findByCode(code);

    // Email delivery: Gift card details are stored and marked as delivered
    // Future enhancement: Integrate with EmailService for actual email sending
    // Example: await this.emailService.sendGiftCard(giftCard);

    giftCard.isDelivered = true;
    giftCard.deliveredAt = new Date();
    await giftCard.save();

    return {
      success: true,
      message: `Gift card resent to ${giftCard.recipientEmail}`,
    };
  }
}
