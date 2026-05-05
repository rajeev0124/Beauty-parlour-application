import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cron } from '@nestjs/schedule';
import { Campaign, CampaignDocument } from './schemas/campaign.schema';
import { User } from '../../schemas/user.schema';
import { EmailService } from '../email/email.service';
import { SmsService } from '../sms/sms.service';
import {
  CreateCampaignDto,
  UpdateCampaignDto,
  QueryCampaignsDto,
} from './dto/campaign.dto';

@Injectable()
export class MarketingService {
  private readonly logger = new Logger(MarketingService.name);

  constructor(
    @InjectModel(Campaign.name) private campaignModel: Model<CampaignDocument>,
    @InjectModel(User.name) private userModel: Model<any>,
    private emailService: EmailService,
    private smsService: SmsService,
  ) {}

  /**
   * Create a new campaign
   */
  async create(dto: CreateCampaignDto, userId: string): Promise<Campaign> {
    const campaign = new this.campaignModel({
      ...dto,
      createdBy: new Types.ObjectId(userId),
      stats: {
        totalRecipients: 0,
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        unsubscribed: 0,
        bounced: 0,
        failed: 0,
      },
    });

    return campaign.save();
  }

  /**
   * Get all campaigns with filters
   */
  async findAll(query: QueryCampaignsDto): Promise<{
    campaigns: Campaign[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const filter: any = {};
    const page = query.page || 1;
    const limit = query.limit || 10;

    if (query.status) filter.status = query.status;
    if (query.type) filter.type = query.type;
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } },
      ];
    }

    const total = await this.campaignModel.countDocuments(filter);
    const campaigns = await this.campaignModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('createdBy', 'name email');

    return {
      campaigns,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get campaign by ID
   */
  async findById(id: string): Promise<Campaign> {
    const campaign = await this.campaignModel.findById(id);
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }
    return campaign;
  }

  /**
   * Update campaign
   */
  async update(id: string, dto: UpdateCampaignDto): Promise<Campaign> {
    const campaign = await this.campaignModel.findById(id);
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    if (!['draft', 'scheduled'].includes(campaign.status)) {
      throw new BadRequestException(
        'Can only edit draft or scheduled campaigns',
      );
    }

    Object.assign(campaign, dto);
    return campaign.save();
  }

  /**
   * Delete campaign
   */
  async delete(id: string): Promise<void> {
    const campaign = await this.campaignModel.findById(id);
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    if (!['draft', 'cancelled', 'completed'].includes(campaign.status)) {
      throw new BadRequestException('Cannot delete active campaigns');
    }

    await this.campaignModel.findByIdAndDelete(id);
  }

  /**
   * Schedule campaign
   */
  async schedule(id: string, scheduledAt: Date): Promise<Campaign> {
    const campaign = await this.campaignModel.findById(id);
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    if (campaign.status !== 'draft') {
      throw new BadRequestException('Only draft campaigns can be scheduled');
    }

    campaign.scheduledAt = scheduledAt;
    campaign.status = 'scheduled';
    return campaign.save();
  }

  /**
   * Launch campaign immediately
   */
  async launch(id: string): Promise<Campaign> {
    const campaign = await this.campaignModel.findById(id);
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    if (!['draft', 'scheduled'].includes(campaign.status)) {
      throw new BadRequestException('Campaign cannot be launched');
    }

    campaign.status = 'active';
    campaign.startedAt = new Date();
    await campaign.save();

    // Execute campaign asynchronously
    this.executeCampaign(campaign._id.toString()).catch((err) => {
      this.logger.error(`Campaign execution failed: ${err.message}`);
    });

    return campaign;
  }

  /**
   * Pause campaign
   */
  async pause(id: string): Promise<Campaign> {
    const campaign = await this.campaignModel.findByIdAndUpdate(
      id,
      { status: 'paused' },
      { new: true },
    );
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }
    return campaign;
  }

  /**
   * Resume paused campaign
   */
  async resume(id: string): Promise<Campaign> {
    const campaign = await this.campaignModel.findById(id);
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    if (campaign.status !== 'paused') {
      throw new BadRequestException('Only paused campaigns can be resumed');
    }

    campaign.status = 'active';
    await campaign.save();

    // Continue execution
    this.executeCampaign(campaign._id.toString()).catch((err) => {
      this.logger.error(`Campaign resume failed: ${err.message}`);
    });

    return campaign;
  }

  /**
   * Get target audience for campaign
   */
  async getTargetAudience(campaign: Campaign): Promise<any[]> {
    const audience = campaign.targetAudience || { segment: 'all' };
    const filter: any = {
      role: 'customer',
      isActive: { $ne: false },
    };

    switch (audience.segment) {
      case 'vip':
        filter['loyaltyPoints'] = { $gte: 1000 };
        break;
      case 'new':
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        filter['createdAt'] = { $gte: thirtyDaysAgo };
        break;
      case 'inactive':
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        filter['lastLoginAt'] = { $lt: ninetyDaysAgo };
        break;
      case 'custom':
        if (audience.customFilter) {
          if (audience.customFilter.membershipTier?.length) {
            filter['membershipTier'] = {
              $in: audience.customFilter.membershipTier,
            };
          }
          if (audience.customFilter.tags?.length) {
            filter['tags'] = { $in: audience.customFilter.tags };
          }
        }
        break;
    }

    if (audience.customerIds?.length) {
      filter['_id'] = {
        $in: audience.customerIds.map((id) => new Types.ObjectId(id)),
      };
    }

    return this.userModel.find(filter).select('name email phone');
  }

  /**
   * Execute campaign - send messages
   */
  private async executeCampaign(campaignId: string): Promise<void> {
    const campaign = await this.campaignModel.findById(campaignId);
    if (!campaign || campaign.status !== 'active') return;

    const recipients = await this.getTargetAudience(campaign);
    campaign.stats.totalRecipients = recipients.length;
    await campaign.save();

    this.logger.log(
      `Executing campaign ${campaign.name} to ${recipients.length} recipients`,
    );

    for (const user of recipients) {
      // Reload campaign status to check if paused
      const currentCampaign = await this.campaignModel.findById(campaignId);
      if (!currentCampaign || currentCampaign.status !== 'active') break;

      try {
        // Send email
        if (['email', 'combined'].includes(campaign.type) && user.email) {
          await this.emailService.sendEmail({
            to: user.email,
            subject: campaign.subject || campaign.name,
            html: campaign.content.replace('{{name}}', user.name || 'Customer'),
          });
          campaign.stats.sent++;
        }

        // Send SMS
        if (
          ['sms', 'combined'].includes(campaign.type) &&
          user.phone &&
          campaign.smsContent
        ) {
          await this.smsService.sendSms({
            to: user.phone,
            message: campaign.smsContent.replace(
              '{{name}}',
              user.name || 'Customer',
            ),
          });
          campaign.stats.sent++;
        }

        campaign.stats.delivered++;
      } catch (error) {
        campaign.stats.failed++;
        this.logger.error(`Failed to send to ${user.email}: ${error.message}`);
      }

      // Save progress periodically
      if (campaign.stats.sent % 50 === 0) {
        await campaign.save();
      }
    }

    campaign.status = 'completed';
    campaign.completedAt = new Date();
    await campaign.save();

    this.logger.log(
      `Campaign ${campaign.name} completed. Sent: ${campaign.stats.sent}, Failed: ${campaign.stats.failed}`,
    );
  }

  /**
   * Process scheduled campaigns - runs every minute
   */
  @Cron('* * * * *', { name: 'campaign-scheduler' })
  async processScheduledCampaigns(): Promise<void> {
    const now = new Date();

    const dueCampaigns = await this.campaignModel.find({
      status: 'scheduled',
      scheduledAt: { $lte: now },
    });

    for (const campaign of dueCampaigns) {
      this.logger.log(`Launching scheduled campaign: ${campaign.name}`);
      campaign.status = 'active';
      campaign.startedAt = now;
      await campaign.save();

      this.executeCampaign(campaign._id.toString()).catch((err) => {
        this.logger.error(`Scheduled campaign failed: ${err.message}`);
      });
    }
  }

  /**
   * Get campaign analytics
   */
  async getAnalytics(): Promise<{
    totalCampaigns: number;
    byStatus: Record<string, number>;
    totalSent: number;
    totalDelivered: number;
    overallDeliveryRate: number;
    recentCampaigns: Campaign[];
  }> {
    const campaigns = await this.campaignModel.find();
    const byStatus: Record<string, number> = {};
    let totalSent = 0;
    let totalDelivered = 0;

    for (const c of campaigns) {
      byStatus[c.status] = (byStatus[c.status] || 0) + 1;
      totalSent += c.stats?.sent || 0;
      totalDelivered += c.stats?.delivered || 0;
    }

    const recentCampaigns = await this.campaignModel
      .find({ status: 'completed' })
      .sort({ completedAt: -1 })
      .limit(5);

    return {
      totalCampaigns: campaigns.length,
      byStatus,
      totalSent,
      totalDelivered,
      overallDeliveryRate:
        totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0,
      recentCampaigns,
    };
  }

  /**
   * Preview campaign with sample data
   */
  async preview(id: string): Promise<{
    estimatedRecipients: number;
    sampleContent: string;
    sampleSms?: string;
  }> {
    const campaign = await this.findById(id);
    const recipients = await this.getTargetAudience(campaign);

    return {
      estimatedRecipients: recipients.length,
      sampleContent: campaign.content.replace('{{name}}', 'Sample Customer'),
      sampleSms: campaign.smsContent?.replace('{{name}}', 'Sample Customer'),
    };
  }

  /**
   * Duplicate campaign
   */
  async duplicate(id: string, userId: string): Promise<Campaign> {
    const original = await this.findById(id);

    const newCampaign = new this.campaignModel({
      name: `${original.name} (Copy)`,
      description: original.description,
      type: original.type,
      subject: original.subject,
      content: original.content,
      smsContent: original.smsContent,
      targetAudience: original.targetAudience,
      couponCode: original.couponCode,
      tags: original.tags,
      status: 'draft',
      createdBy: new Types.ObjectId(userId),
      stats: {
        totalRecipients: 0,
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        unsubscribed: 0,
        bounced: 0,
        failed: 0,
      },
    });

    return newCampaign.save();
  }
}
