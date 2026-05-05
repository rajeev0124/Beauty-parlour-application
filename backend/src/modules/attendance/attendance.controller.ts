import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AttendanceService } from './attendance.service';
import {
  CheckInDto,
  CheckOutDto,
  RequestLeaveDto,
  ApproveLeaveDto,
  GetAttendanceDto,
  UpdateAttendanceDto,
} from './dto/attendance.dto';

@Controller('attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  /**
   * Staff check-in
   */
  @Post('check-in')
  @UseGuards(RolesGuard)
  @Roles('staff', 'admin', 'super-admin')
  async checkIn(@Request() req, @Body() dto: CheckInDto) {
    const staffId = req.user._id.toString();
    const attendance = await this.attendanceService.checkIn(staffId, dto);
    return {
      success: true,
      data: attendance,
      message: 'Checked in successfully',
    };
  }

  /**
   * Staff check-out
   */
  @Post('check-out')
  @UseGuards(RolesGuard)
  @Roles('staff', 'admin', 'super-admin')
  async checkOut(@Request() req, @Body() dto: CheckOutDto) {
    const staffId = req.user._id.toString();
    const attendance = await this.attendanceService.checkOut(staffId, dto);
    return {
      success: true,
      data: attendance,
      message: 'Checked out successfully',
    };
  }

  /**
   * Get my today's status
   */
  @Get('my-today')
  @UseGuards(RolesGuard)
  @Roles('staff', 'admin', 'super-admin')
  async getMyTodayStatus(@Request() req) {
    const staffId = req.user._id.toString();
    const status = await this.attendanceService.getTodayStatus(staffId);
    return {
      success: true,
      data: status,
    };
  }

  /**
   * Request leave
   */
  @Post('leave')
  @UseGuards(RolesGuard)
  @Roles('staff', 'admin', 'super-admin')
  async requestLeave(@Request() req, @Body() dto: RequestLeaveDto) {
    const staffId = req.user._id.toString();
    const leave = await this.attendanceService.requestLeave(staffId, dto);
    return {
      success: true,
      data: leave,
      message: 'Leave request submitted',
    };
  }

  /**
   * Get my monthly report
   */
  @Get('my-report/:year/:month')
  @UseGuards(RolesGuard)
  @Roles('staff', 'admin', 'super-admin')
  async getMyMonthlyReport(
    @Request() req,
    @Param('year') year: string,
    @Param('month') month: string,
  ) {
    const staffId = req.user._id.toString();
    const report = await this.attendanceService.getMonthlyReport(
      staffId,
      parseInt(year),
      parseInt(month),
    );
    return {
      success: true,
      data: report,
    };
  }

  // ==================== ADMIN ROUTES ====================

  /**
   * Get pending leave requests
   */
  @Get('admin/pending-leaves')
  @UseGuards(RolesGuard)
  @Roles('admin', 'super-admin')
  async getPendingLeaves() {
    const leaves = await this.attendanceService.getPendingLeaves();
    return {
      success: true,
      data: leaves,
    };
  }

  /**
   * Approve or reject leave
   */
  @Patch('admin/:id/approve')
  @UseGuards(RolesGuard)
  @Roles('admin', 'super-admin')
  async approveLeave(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: ApproveLeaveDto,
  ) {
    const adminId = req.user._id.toString();
    const attendance = await this.attendanceService.approveLeave(
      id,
      dto.approved,
      adminId,
      dto.notes,
    );
    return {
      success: true,
      data: attendance,
      message: dto.approved ? 'Leave approved' : 'Leave rejected',
    };
  }

  /**
   * Get today's team attendance
   */
  @Get('admin/today')
  @UseGuards(RolesGuard)
  @Roles('admin', 'super-admin')
  async getTodayTeamAttendance() {
    const data = await this.attendanceService.getTodayTeamAttendance();
    return {
      success: true,
      data,
    };
  }

  /**
   * Get attendance records with filters
   */
  @Get('admin/records')
  @UseGuards(RolesGuard)
  @Roles('admin', 'super-admin')
  async getAttendanceRecords(@Query() query: GetAttendanceDto) {
    const records = await this.attendanceService.getAttendance(query);
    return {
      success: true,
      data: records,
    };
  }

  /**
   * Get staff monthly report
   */
  @Get('admin/report/:staffId/:year/:month')
  @UseGuards(RolesGuard)
  @Roles('admin', 'super-admin')
  async getStaffMonthlyReport(
    @Param('staffId') staffId: string,
    @Param('year') year: string,
    @Param('month') month: string,
  ) {
    const report = await this.attendanceService.getMonthlyReport(
      staffId,
      parseInt(year),
      parseInt(month),
    );
    return {
      success: true,
      data: report,
    };
  }

  /**
   * Update attendance record
   */
  @Patch('admin/:id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'super-admin')
  async updateAttendance(
    @Param('id') id: string,
    @Body() dto: UpdateAttendanceDto,
  ) {
    const attendance = await this.attendanceService.updateAttendance(id, dto);
    return {
      success: true,
      data: attendance,
      message: 'Attendance updated',
    };
  }

  /**
   * Mark attendance for staff (admin)
   */
  @Post('admin/mark')
  @UseGuards(RolesGuard)
  @Roles('admin', 'super-admin')
  async markAttendance(
    @Body()
    body: {
      staffId: string;
      date: string;
      status: string;
      notes?: string;
    },
  ) {
    const attendance = await this.attendanceService.markAttendance(
      body.staffId,
      body.date,
      body.status,
      body.notes,
    );
    return {
      success: true,
      data: attendance,
      message: 'Attendance marked',
    };
  }
}
