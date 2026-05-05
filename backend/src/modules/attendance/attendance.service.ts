import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Attendance } from './schemas/attendance.schema';
import {
  CheckInDto,
  CheckOutDto,
  RequestLeaveDto,
  GetAttendanceDto,
  UpdateAttendanceDto,
} from './dto/attendance.dto';

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);

  constructor(
    @InjectModel(Attendance.name) private attendanceModel: Model<any>,
  ) {}

  /**
   * Staff check-in
   */
  async checkIn(staffId: string, dto: CheckInDto): Promise<Attendance> {
    const today = new Date().toISOString().split('T')[0];

    // Check if already checked in today
    const existing = await this.attendanceModel.findOne({
      staffId: staffId,
      date: today,
    });

    if (existing?.checkInTime) {
      throw new BadRequestException('Already checked in today');
    }

    const attendance =
      existing ||
      new this.attendanceModel({
        staffId: staffId,
        date: today,
      });

    attendance.checkInTime = new Date();
    attendance.status = 'present';
    attendance.location = dto.location;
    attendance.notes = dto.notes;

    return attendance.save();
  }

  /**
   * Staff check-out
   */
  async checkOut(staffId: string, dto: CheckOutDto): Promise<Attendance> {
    const today = new Date().toISOString().split('T')[0];

    const attendance = await this.attendanceModel.findOne({
      staffId: staffId,
      date: today,
    });

    if (!attendance) {
      throw new NotFoundException('No check-in found for today');
    }

    if (!attendance.checkInTime) {
      throw new BadRequestException('Must check in before checking out');
    }

    if (attendance.checkOutTime) {
      throw new BadRequestException('Already checked out today');
    }

    attendance.checkOutTime = new Date();
    attendance.breakMinutes = dto.breakMinutes || 0;

    // Calculate working hours
    const checkIn = new Date(attendance.checkInTime).getTime();
    const checkOut = new Date(attendance.checkOutTime).getTime();
    const breakMs = (dto.breakMinutes || 0) * 60 * 1000;
    const workingMs = checkOut - checkIn - breakMs;
    attendance.workingHours =
      Math.round((workingMs / (1000 * 60 * 60)) * 100) / 100;

    // Calculate overtime (assuming 8 hours standard)
    if (attendance.workingHours > 8) {
      attendance.overtimeHours =
        Math.round((attendance.workingHours - 8) * 100) / 100;
    }

    if (dto.notes) {
      attendance.notes = attendance.notes
        ? `${attendance.notes}\n${dto.notes}`
        : dto.notes;
    }

    return attendance.save();
  }

  /**
   * Request leave
   */
  async requestLeave(
    staffId: string,
    dto: RequestLeaveDto,
  ): Promise<Attendance> {
    // Check if already has attendance for that date
    const existing = await this.attendanceModel.findOne({
      staffId: staffId,
      date: dto.date,
    });

    if (existing) {
      if (existing.checkInTime) {
        throw new BadRequestException(
          'Cannot request leave for a day already worked',
        );
      }
      // Update existing record
      existing.status = 'leave';
      existing.leaveType = dto.leaveType;
      existing.leaveReason = dto.reason;
      existing.isApproved = false;
      return existing.save();
    }

    // Create new leave request
    return this.attendanceModel.create({
      staffId: staffId,
      date: dto.date,
      status: 'leave',
      leaveType: dto.leaveType,
      leaveReason: dto.reason,
      isApproved: false,
    });
  }

  /**
   * Approve or reject leave (admin)
   */
  async approveLeave(
    attendanceId: string,
    approved: boolean,
    approvedBy: string,
    notes?: string,
  ): Promise<Attendance> {
    const attendance = await this.attendanceModel.findById(attendanceId);

    if (!attendance) {
      throw new NotFoundException('Leave request not found');
    }

    if (attendance.status !== 'leave') {
      throw new BadRequestException('This is not a leave request');
    }

    attendance.isApproved = approved;
    attendance.approvedBy = approvedBy;

    if (!approved) {
      attendance.status = 'absent'; // Mark as absent if leave rejected
    }

    if (notes) {
      attendance.notes = notes;
    }

    return attendance.save();
  }

  /**
   * Get attendance records with filters
   */
  async getAttendance(query: GetAttendanceDto): Promise<Attendance[]> {
    const filter: any = {};

    if (query.staffId) {
      filter.staffId = query.staffId;
    }

    if (query.startDate || query.endDate) {
      filter.date = {};
      if (query.startDate) filter.date.$gte = query.startDate;
      if (query.endDate) filter.date.$lte = query.endDate;
    }

    if (query.status) {
      filter.status = query.status;
    }

    return this.attendanceModel
      .find(filter)
      .populate('staffId', 'name email')
      .sort({ date: -1 })
      .exec();
  }

  /**
   * Get staff attendance summary for a month
   */
  async getMonthlyReport(staffId: string, year: number, month: number) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

    const records = await this.attendanceModel.find({
      staffId: staffId,
      date: { $gte: startDate, $lte: endDate },
    });

    const summary = {
      totalDays: records.length,
      presentDays: 0,
      absentDays: 0,
      leaveDays: 0,
      halfDays: 0,
      holidays: 0,
      totalWorkingHours: 0,
      totalOvertimeHours: 0,
      averageWorkingHours: 0,
      pendingLeaves: 0,
    };

    for (const record of records) {
      switch (record.status) {
        case 'present':
          summary.presentDays++;
          break;
        case 'absent':
          summary.absentDays++;
          break;
        case 'leave':
          summary.leaveDays++;
          if (!record.isApproved) summary.pendingLeaves++;
          break;
        case 'half-day':
          summary.halfDays++;
          break;
        case 'holiday':
          summary.holidays++;
          break;
      }
      summary.totalWorkingHours += record.workingHours || 0;
      summary.totalOvertimeHours += record.overtimeHours || 0;
    }

    if (summary.presentDays + summary.halfDays > 0) {
      summary.averageWorkingHours =
        Math.round(
          (summary.totalWorkingHours /
            (summary.presentDays + summary.halfDays * 0.5)) *
            100,
        ) / 100;
    }

    return {
      staffId,
      period: `${year}-${String(month).padStart(2, '0')}`,
      summary,
      records,
    };
  }

  /**
   * Get today's attendance status
   */
  async getTodayStatus(staffId: string): Promise<Partial<Attendance> | null> {
    const today = new Date().toISOString().split('T')[0];
    return this.attendanceModel.findOne({
      staffId: staffId,
      date: today,
    });
  }

  /**
   * Get pending leave requests (admin)
   */
  async getPendingLeaves(): Promise<Attendance[]> {
    return this.attendanceModel
      .find({
        status: 'leave',
        isApproved: false,
      })
      .populate('staffId', 'name email')
      .sort({ date: 1 })
      .exec();
  }

  /**
   * Update attendance record (admin)
   */
  async updateAttendance(
    attendanceId: string,
    dto: UpdateAttendanceDto,
  ): Promise<Attendance> {
    const attendance = await this.attendanceModel.findByIdAndUpdate(
      attendanceId,
      dto,
      { new: true },
    );

    if (!attendance) {
      throw new NotFoundException('Attendance record not found');
    }

    return attendance;
  }

  /**
   * Mark attendance for a staff (admin)
   */
  async markAttendance(
    staffId: string,
    date: string,
    status: string,
    notes?: string,
  ): Promise<Attendance> {
    const result = await this.attendanceModel.findOneAndUpdate(
      {
        staffId: staffId,
        date,
      },
      {
        staffId: staffId,
        date,
        status,
        notes,
      },
      { upsert: true, new: true },
    );
    return result;
  }

  /**
   * Get team attendance for today (admin dashboard)
   */
  async getTodayTeamAttendance() {
    const today = new Date().toISOString().split('T')[0];

    const records = await this.attendanceModel
      .find({ date: today })
      .populate('staffId', 'name email role');

    return {
      date: today,
      totalCheckedIn: records.filter((r) => r.checkInTime).length,
      totalOnLeave: records.filter((r) => r.status === 'leave').length,
      records,
    };
  }
}
