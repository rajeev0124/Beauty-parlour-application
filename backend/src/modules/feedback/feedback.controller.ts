import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto, RespondToFeedbackDto } from './dto/feedback.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Feedback')
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  // === Public Endpoints ===

  @Get('public')
  @ApiOperation({ summary: 'Get public feedback/reviews' })
  async getPublicFeedback(
    @Query('type') type?: string,
    @Query('minRating') minRating?: string,
    @Query('limit') limit?: string,
  ) {
    return this.feedbackService.getPublicFeedback({
      type,
      minRating: minRating ? parseInt(minRating) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get('testimonials')
  @ApiOperation({ summary: 'Get highlighted testimonials for homepage' })
  async getTestimonials(@Query('limit') limit?: string) {
    return this.feedbackService.getTestimonials(limit ? parseInt(limit) : 10);
  }

  @Get('staff/:staffId/ratings')
  @ApiOperation({ summary: 'Get staff ratings and reviews' })
  async getStaffRatings(@Param('staffId') staffId: string) {
    return this.feedbackService.getStaffRatings(staffId);
  }

  // === Customer Endpoints ===

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Submit feedback' })
  async create(@CurrentUser() user: any, @Body() dto: CreateFeedbackDto) {
    return this.feedbackService.create(
      user._id.toString(),
      user.name,
      user.email,
      dto,
    );
  }

  @Get('my-feedback')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user feedback history' })
  async getMyFeedback(@CurrentUser() user: any) {
    return this.feedbackService.findByUser(user._id.toString());
  }

  @Post(':id/helpful')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Mark feedback as helpful' })
  async markHelpful(@Param('id') id: string, @CurrentUser() user: any) {
    return this.feedbackService.markHelpful(id, user._id.toString());
  }

  // === Admin Endpoints ===

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all feedback (admin)' })
  async findAll(
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('minRating') minRating?: string,
    @Query('maxRating') maxRating?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.feedbackService.findAll({
      type,
      status,
      minRating: minRating ? parseInt(minRating) : undefined,
      maxRating: maxRating ? parseInt(maxRating) : undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @Get('analytics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get feedback analytics (admin)' })
  async getAnalytics(@Query('days') days?: string) {
    return this.feedbackService.getAnalytics(days ? parseInt(days) : 30);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get feedback by ID (admin)' })
  async findById(@Param('id') id: string) {
    return this.feedbackService.findById(id);
  }

  @Post(':id/respond')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Respond to feedback (admin)' })
  async respond(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: RespondToFeedbackDto,
  ) {
    return this.feedbackService.respond(id, user._id.toString(), dto);
  }

  @Put(':id/highlight')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Toggle feedback highlight (admin)' })
  async toggleHighlight(@Param('id') id: string) {
    return this.feedbackService.toggleHighlight(id);
  }
}
