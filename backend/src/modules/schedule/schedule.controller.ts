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
  Patch,
  Req,
} from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import {
  CreateScheduleDto,
  UpdateScheduleDto,
  BulkScheduleDto,
  LeaveRequestDto,
} from './dto/schedule.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('schedule')
@UseGuards(JwtAuthGuard)
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  create(@Body() createScheduleDto: CreateScheduleDto) {
    if (createScheduleDto.isRecurring) {
      return this.scheduleService.createRecurring(createScheduleDto);
    }
    return this.scheduleService.create(createScheduleDto);
  }

  @Post('bulk')
  @UseGuards(RolesGuard)
  @Roles('admin')
  createBulk(@Body() bulkDto: BulkScheduleDto) {
    return this.scheduleService.createBulkSchedules(bulkDto);
  }

  @Post('leave')
  @UseGuards(RolesGuard)
  @Roles('admin')
  requestLeave(@Body() leaveRequestDto: LeaveRequestDto, @Req() req: any) {
    return this.scheduleService.requestLeave(leaveRequestDto, req.user?._id);
  }

  @Get()
  findAll(
    @Query('staff') staff?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
  ) {
    return this.scheduleService.findAll({
      staff,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      status,
    });
  }

  @Get('today')
  getTodaySchedules() {
    return this.scheduleService.getTodaySchedules();
  }

  @Get('calendar')
  getCalendarData(@Query('month') month: string, @Query('year') year: string) {
    return this.scheduleService.getCalendarData(
      parseInt(month),
      parseInt(year),
    );
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles('admin')
  getStats(@Query('month') month?: string, @Query('year') year?: string) {
    // If no month/year provided, return dashboard stats
    if (!month || !year) {
      return this.scheduleService.getDashboardStats();
    }
    return this.scheduleService.getScheduleStats(
      parseInt(month),
      parseInt(year),
    );
  }

  @Get('range')
  findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.scheduleService.findByDateRange(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('staff/:staffId')
  findByStaff(
    @Param('staffId') staffId: string,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.scheduleService.findByStaff(
      staffId,
      month ? parseInt(month) : undefined,
      year ? parseInt(year) : undefined,
    );
  }

  @Get('staff/:staffId/availability')
  getStaffAvailability(
    @Param('staffId') staffId: string,
    @Query('date') date: string,
  ) {
    return this.scheduleService.getStaffAvailability(staffId, new Date(date));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.scheduleService.findOne(id);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  update(
    @Param('id') id: string,
    @Body() updateScheduleDto: UpdateScheduleDto,
  ) {
    return this.scheduleService.update(id, updateScheduleDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.scheduleService.remove(id);
  }

  @Patch(':id/check-in')
  checkIn(@Param('id') id: string) {
    return this.scheduleService.checkIn(id);
  }

  @Patch(':id/check-out')
  checkOut(@Param('id') id: string) {
    return this.scheduleService.checkOut(id);
  }
}
