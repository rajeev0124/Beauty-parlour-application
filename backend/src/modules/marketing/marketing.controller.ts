import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { MarketingService } from './marketing.service';
import { CreateCampaignDto, UpdateCampaignDto, QueryCampaignsDto } from './dto/campaign.dto';

@Controller('marketing')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'super-admin')
export class MarketingController {
  constructor(private readonly marketingService: MarketingService) {}

  /**
   * Create new campaign
   */
  @Post('campaigns')
  async create(@Request() req, @Body() dto: CreateCampaignDto) {
    const campaign = await this.marketingService.create(dto, req.user._id.toString());
    return {
      success: true,
      data: campaign,
      message: 'Campaign created successfully',
    };
  }

  /**
   * Get all campaigns
   */
  @Get('campaigns')
  async findAll(@Query() query: QueryCampaignsDto) {
    const result = await this.marketingService.findAll(query);
    return {
      success: true,
      data: result.campaigns,
      meta: {
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
      },
    };
  }

  /**
   * Get campaign analytics
   */
  @Get('analytics')
  async getAnalytics() {
    const analytics = await this.marketingService.getAnalytics();
    return {
      success: true,
      data: analytics,
    };
  }

  /**
   * Get campaign by ID
   */
  @Get('campaigns/:id')
  async findOne(@Param('id') id: string) {
    const campaign = await this.marketingService.findById(id);
    return {
      success: true,
      data: campaign,
    };
  }

  /**
   * Preview campaign
   */
  @Get('campaigns/:id/preview')
  async preview(@Param('id') id: string) {
    const preview = await this.marketingService.preview(id);
    return {
      success: true,
      data: preview,
    };
  }

  /**
   * Update campaign
   */
  @Patch('campaigns/:id')
  async update(@Param('id') id: string, @Body() dto: UpdateCampaignDto) {
    const campaign = await this.marketingService.update(id, dto);
    return {
      success: true,
      data: campaign,
      message: 'Campaign updated',
    };
  }

  /**
   * Delete campaign
   */
  @Delete('campaigns/:id')
  async delete(@Param('id') id: string) {
    await this.marketingService.delete(id);
    return {
      success: true,
      message: 'Campaign deleted',
    };
  }

  /**
   * Schedule campaign
   */
  @Post('campaigns/:id/schedule')
  async schedule(
    @Param('id') id: string,
    @Body('scheduledAt') scheduledAt: string,
  ) {
    const campaign = await this.marketingService.schedule(id, new Date(scheduledAt));
    return {
      success: true,
      data: campaign,
      message: 'Campaign scheduled',
    };
  }

  /**
   * Launch campaign immediately
   */
  @Post('campaigns/:id/launch')
  async launch(@Param('id') id: string) {
    const campaign = await this.marketingService.launch(id);
    return {
      success: true,
      data: campaign,
      message: 'Campaign launched',
    };
  }

  /**
   * Pause campaign
   */
  @Post('campaigns/:id/pause')
  async pause(@Param('id') id: string) {
    const campaign = await this.marketingService.pause(id);
    return {
      success: true,
      data: campaign,
      message: 'Campaign paused',
    };
  }

  /**
   * Resume campaign
   */
  @Post('campaigns/:id/resume')
  async resume(@Param('id') id: string) {
    const campaign = await this.marketingService.resume(id);
    return {
      success: true,
      data: campaign,
      message: 'Campaign resumed',
    };
  }

  /**
   * Duplicate campaign
   */
  @Post('campaigns/:id/duplicate')
  async duplicate(@Request() req, @Param('id') id: string) {
    const campaign = await this.marketingService.duplicate(id, req.user._id.toString());
    return {
      success: true,
      data: campaign,
      message: 'Campaign duplicated',
    };
  }
}
