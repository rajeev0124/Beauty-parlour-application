import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { SchedulerService } from './scheduler.service';

@Controller('scheduler')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SchedulerController {
  constructor(private readonly schedulerService: SchedulerService) {}

  /**
   * Get all scheduled jobs status
   */
  @Get('jobs')
  @Roles('admin', 'super-admin')
  getJobs() {
    const jobs = this.schedulerService.getJobsStatus();
    return {
      success: true,
      data: jobs,
      message: 'Scheduled jobs retrieved successfully',
    };
  }

  /**
   * Enable or disable a job
   */
  @Post('jobs/:jobId/toggle')
  @Roles('admin', 'super-admin')
  toggleJob(
    @Param('jobId') jobId: string,
    @Body('enabled') enabled: boolean,
  ) {
    const result = this.schedulerService.setJobEnabled(jobId, enabled);
    return {
      success: result,
      message: result
        ? `Job ${enabled ? 'enabled' : 'disabled'} successfully`
        : 'Job not found',
    };
  }

  /**
   * Manually trigger a job
   */
  @Post('jobs/:jobId/trigger')
  @Roles('admin', 'super-admin')
  async triggerJob(@Param('jobId') jobId: string) {
    const result = await this.schedulerService.triggerJob(jobId);
    return {
      success: result,
      message: result ? 'Job triggered successfully' : 'Job not found',
    };
  }
}
