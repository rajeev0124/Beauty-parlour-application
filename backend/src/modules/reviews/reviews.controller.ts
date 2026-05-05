import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, ReplyReviewDto } from './dto/review.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // Public - Get approved reviews for display
  @Get('public')
  findPublic() {
    return this.reviewsService.findPublic();
  }

  // Public - Get review stats
  @Get('stats')
  getStats() {
    return this.reviewsService.getStats();
  }

  // Protected - Get all reviews (admin)
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  findAll(
    @Query() query: { approved?: string; serviceId?: string; staffId?: string },
  ) {
    return this.reviewsService.findAll(query);
  }

  // Protected - Create review (logged in user)
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req, @Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(
      req.user._id.toString(),
      req.user.name,
      createReviewDto,
    );
  }

  // Admin - Approve review
  @Put(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  approve(@Param('id') id: string) {
    return this.reviewsService.approve(id);
  }

  // Admin - Reject review
  @Put(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  reject(@Param('id') id: string) {
    return this.reviewsService.reject(id);
  }

  // Admin - Reply to review
  @Put(':id/reply')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  reply(@Param('id') id: string, @Body() replyDto: ReplyReviewDto) {
    return this.reviewsService.reply(id, replyDto);
  }

  // Admin - Delete review
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  delete(@Param('id') id: string) {
    return this.reviewsService.delete(id);
  }
}
