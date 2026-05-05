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
import { WaitlistService } from './waitlist.service';

@Controller('waitlist')
@UseGuards(JwtAuthGuard)
export class WaitlistController {
  constructor(private readonly waitlistService: WaitlistService) {}

  /**
   * Join waitlist
   */
  @Post()
  async join(
    @Request() req,
    @Body()
    body: {
      serviceId: string;
      serviceName: string;
      preferredDate: string;
      preferredTimeSlots?: string[];
      preferredStaffId?: string;
      notes?: string;
    },
  ) {
    const entry = await this.waitlistService.join({
      userId: req.user._id.toString(),
      customerName: req.user.name,
      customerEmail: req.user.email,
      customerPhone: req.user.phone,
      ...body,
    });
    return {
      success: true,
      data: entry,
      message: 'Added to waitlist successfully',
    };
  }

  /**
   * Get my waitlist entries
   */
  @Get('my')
  async getMyWaitlist(@Request() req) {
    const entries = await this.waitlistService.getMyWaitlist(
      req.user._id.toString(),
    );
    return {
      success: true,
      data: entries,
    };
  }

  /**
   * Cancel waitlist entry
   */
  @Delete(':id')
  async cancel(@Request() req, @Param('id') id: string) {
    await this.waitlistService.cancel(id, req.user._id.toString());
    return {
      success: true,
      message: 'Removed from waitlist',
    };
  }

  // ==================== ADMIN ROUTES ====================

  /**
   * Get all waitlist entries (admin)
   */
  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles('admin', 'super-admin')
  async getAllWaitlist(
    @Query('date') date?: string,
    @Query('serviceId') serviceId?: string,
    @Query('status') status?: string,
  ) {
    const entries = await this.waitlistService.getAllWaitlist({
      date,
      serviceId,
      status,
    });
    return {
      success: true,
      data: entries,
    };
  }

  /**
   * Get waitlist statistics
   */
  @Get('admin/stats')
  @UseGuards(RolesGuard)
  @Roles('admin', 'super-admin')
  async getStats() {
    const stats = await this.waitlistService.getStats();
    return {
      success: true,
      data: stats,
    };
  }

  /**
   * Manually notify next in waitlist
   */
  @Post('admin/notify-next')
  @UseGuards(RolesGuard)
  @Roles('admin', 'super-admin')
  async notifyNext(
    @Body() body: { serviceId: string; date: string; time: string },
  ) {
    const entry = await this.waitlistService.notifyNext(
      body.serviceId,
      body.date,
      body.time,
    );
    return {
      success: true,
      data: entry,
      message: entry ? 'Customer notified' : 'No one on waitlist',
    };
  }

  /**
   * Update priority
   */
  @Patch('admin/:id/priority')
  @UseGuards(RolesGuard)
  @Roles('admin', 'super-admin')
  async updatePriority(
    @Param('id') id: string,
    @Body('priority') priority: number,
  ) {
    const entry = await this.waitlistService.updatePriority(id, priority);
    return {
      success: true,
      data: entry,
      message: 'Priority updated',
    };
  }

  /**
   * Mark entry as booked
   */
  @Patch('admin/:id/booked')
  @UseGuards(RolesGuard)
  @Roles('admin', 'super-admin')
  async markAsBooked(
    @Param('id') id: string,
    @Body('appointmentId') appointmentId: string,
  ) {
    await this.waitlistService.markAsBooked(id, appointmentId);
    return {
      success: true,
      message: 'Marked as booked',
    };
  }
}
