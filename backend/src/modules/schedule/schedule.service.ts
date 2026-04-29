import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { StaffSchedule, StaffScheduleDocument } from './schemas/staff-schedule.schema';
import { CreateScheduleDto, UpdateScheduleDto, BulkScheduleDto, LeaveRequestDto } from './dto/schedule.dto';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectModel(StaffSchedule.name)
    private scheduleModel: Model<StaffScheduleDocument>,
  ) {}

  async create(createScheduleDto: CreateScheduleDto): Promise<StaffSchedule> {
    // Check for existing schedule on same date for same staff
    const existing = await this.scheduleModel.findOne({
      staff: new Types.ObjectId(createScheduleDto.staff),
      date: new Date(createScheduleDto.date),
    });

    if (existing) {
      throw new ConflictException('Schedule already exists for this staff on this date');
    }

    const schedule = new this.scheduleModel({
      ...createScheduleDto,
      staff: new Types.ObjectId(createScheduleDto.staff),
    });

    return schedule.save();
  }

  async createRecurring(createScheduleDto: CreateScheduleDto): Promise<StaffSchedule[]> {
    if (!createScheduleDto.isRecurring || !createScheduleDto.recurringConfig) {
      throw new BadRequestException('Recurring config is required for recurring schedules');
    }

    const schedules: StaffSchedule[] = [];
    const config = createScheduleDto.recurringConfig;
    const startDate = new Date(createScheduleDto.date);
    const endDate = config.endDate ? new Date(config.endDate) : new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days default

    // Create parent schedule
    const parentSchedule = await this.create(createScheduleDto);
    schedules.push(parentSchedule);

    // Generate recurring schedules
    let currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + 1);

    while (currentDate <= endDate) {
      let shouldCreate = false;

      switch (config.pattern) {
        case 'daily':
          shouldCreate = true;
          break;
        case 'weekly':
          if (config.daysOfWeek?.includes(currentDate.getDay())) {
            shouldCreate = true;
          }
          break;
        case 'monthly':
          if (currentDate.getDate() === startDate.getDate()) {
            shouldCreate = true;
          }
          break;
      }

      if (shouldCreate) {
        try {
          const childSchedule = await this.scheduleModel.create({
            staff: new Types.ObjectId(createScheduleDto.staff),
            date: new Date(currentDate),
            startTime: createScheduleDto.startTime,
            endTime: createScheduleDto.endTime,
            breaks: createScheduleDto.breaks,
            isRecurring: true,
            recurringParent: parentSchedule['_id'],
            status: 'scheduled',
          });
          schedules.push(childSchedule);
        } catch (error) {
          // Skip if conflict
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return schedules;
  }

  async findAll(query?: {
    staff?: string;
    startDate?: Date;
    endDate?: Date;
    status?: string;
  }): Promise<StaffSchedule[]> {
    const filter: any = {};

    if (query?.staff) {
      filter.staff = new Types.ObjectId(query.staff);
    }

    if (query?.startDate || query?.endDate) {
      filter.date = {};
      if (query.startDate) {
        filter.date.$gte = new Date(query.startDate);
      }
      if (query.endDate) {
        filter.date.$lte = new Date(query.endDate);
      }
    }

    if (query?.status) {
      filter.status = query.status;
    }

    return this.scheduleModel
      .find(filter)
      .populate('staff', 'name email phone role')
      .sort({ date: 1, startTime: 1 })
      .exec();
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<StaffSchedule[]> {
    return this.scheduleModel
      .find({
        date: { $gte: startDate, $lte: endDate },
      })
      .populate('staff', 'name email phone role specializations')
      .sort({ date: 1, startTime: 1 })
      .exec();
  }

  async findByStaff(staffId: string, month?: number, year?: number): Promise<StaffSchedule[]> {
    const filter: any = { staff: new Types.ObjectId(staffId) };

    if (month !== undefined && year !== undefined) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      filter.date = { $gte: startDate, $lte: endDate };
    }

    return this.scheduleModel
      .find(filter)
      .sort({ date: 1 })
      .exec();
  }

  async findOne(id: string): Promise<StaffSchedule> {
    const schedule = await this.scheduleModel
      .findById(id)
      .populate('staff', 'name email phone role')
      .exec();

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    return schedule;
  }

  async getCalendarData(month: number, year: number): Promise<any[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const schedules = await this.scheduleModel
      .find({
        date: { $gte: startDate, $lte: endDate },
      })
      .populate('staff', 'name email role')
      .lean()
      .exec();

    // Group by date
    const calendarData: { [key: string]: any[] } = {};

    schedules.forEach(schedule => {
      const dateKey = schedule.date.toISOString().split('T')[0];
      if (!calendarData[dateKey]) {
        calendarData[dateKey] = [];
      }
      calendarData[dateKey].push({
        id: schedule._id,
        staff: schedule.staff,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        status: schedule.status,
        isLeave: schedule.isLeave,
        isHoliday: schedule.isHoliday,
        totalHours: schedule.totalHours,
      });
    });

    return Object.entries(calendarData).map(([date, events]) => ({
      date,
      events,
    }));
  }

  async update(id: string, updateScheduleDto: UpdateScheduleDto): Promise<StaffSchedule> {
    const schedule = await this.scheduleModel
      .findByIdAndUpdate(id, updateScheduleDto, { new: true })
      .populate('staff', 'name email phone role')
      .exec();

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    return schedule;
  }

  async remove(id: string): Promise<void> {
    const result = await this.scheduleModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Schedule not found');
    }
  }

  async checkIn(id: string): Promise<StaffSchedule> {
    const schedule = await this.scheduleModel.findById(id);
    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    schedule.checkInTime = new Date();
    schedule.status = 'working';
    return schedule.save();
  }

  async checkOut(id: string): Promise<StaffSchedule> {
    const schedule = await this.scheduleModel.findById(id);
    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    schedule.checkOutTime = new Date();
    schedule.status = 'completed';
    return schedule.save();
  }

  async createBulkSchedules(bulkDto: BulkScheduleDto): Promise<StaffSchedule[]> {
    const schedules: StaffSchedule[] = [];
    const startDate = new Date(bulkDto.startDate);
    const endDate = new Date(bulkDto.endDate);

    for (const staffId of bulkDto.staffIds) {
      let currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        // Check if day should be included
        const dayOfWeek = currentDate.getDay();
        if (!bulkDto.daysOfWeek || bulkDto.daysOfWeek.includes(dayOfWeek)) {
          try {
            const schedule = await this.scheduleModel.create({
              staff: new Types.ObjectId(staffId),
              date: new Date(currentDate),
              startTime: bulkDto.startTime,
              endTime: bulkDto.endTime,
              breaks: bulkDto.breaks || [],
              status: 'scheduled',
            });
            schedules.push(schedule);
          } catch (error) {
            // Skip conflicts
          }
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    return schedules;
  }

  async requestLeave(leaveRequestDto: LeaveRequestDto, approverId?: string): Promise<StaffSchedule[]> {
    const leaves: StaffSchedule[] = [];
    const startDate = new Date(leaveRequestDto.startDate);
    const endDate = new Date(leaveRequestDto.endDate);

    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      // Update existing schedule or create new leave entry
      const existing = await this.scheduleModel.findOne({
        staff: new Types.ObjectId(leaveRequestDto.staff),
        date: new Date(currentDate),
      });

      if (existing) {
        existing.isLeave = true;
        existing.status = 'leave';
        existing.leaveType = leaveRequestDto.leaveType;
        existing.leaveReason = leaveRequestDto.reason;
        if (approverId) {
          existing.approvedBy = new Types.ObjectId(approverId);
          existing.approvedAt = new Date();
        }
        await existing.save();
        leaves.push(existing);
      } else {
        const leave = await this.scheduleModel.create({
          staff: new Types.ObjectId(leaveRequestDto.staff),
          date: new Date(currentDate),
          startTime: '00:00',
          endTime: '00:00',
          isLeave: true,
          status: 'leave',
          leaveType: leaveRequestDto.leaveType,
          leaveReason: leaveRequestDto.reason,
          approvedBy: approverId ? new Types.ObjectId(approverId) : undefined,
          approvedAt: approverId ? new Date() : undefined,
        });
        leaves.push(leave);
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return leaves;
  }

  async getStaffAvailability(staffId: string, date: Date): Promise<{
    isAvailable: boolean;
    schedule?: StaffSchedule;
    availableSlots: { start: string; end: string }[];
  }> {
    const schedule = await this.scheduleModel.findOne({
      staff: new Types.ObjectId(staffId),
      date: new Date(date),
    });

    if (!schedule || schedule.isLeave || schedule.isHoliday) {
      return { isAvailable: false, schedule: schedule ?? undefined, availableSlots: [] };
    }

    // Calculate available slots (excluding breaks)
    const availableSlots: { start: string; end: string }[] = [];
    let currentStart = schedule.startTime;

    if (schedule.breaks && schedule.breaks.length > 0) {
      const sortedBreaks = [...schedule.breaks].sort((a, b) => 
        a.breakStart.localeCompare(b.breakStart)
      );

      for (const brk of sortedBreaks) {
        if (currentStart < brk.breakStart) {
          availableSlots.push({ start: currentStart, end: brk.breakStart });
        }
        currentStart = brk.breakEnd;
      }
    }

    if (currentStart < schedule.endTime) {
      availableSlots.push({ start: currentStart, end: schedule.endTime });
    }

    return { isAvailable: true, schedule, availableSlots };
  }

  async getScheduleStats(month: number, year: number): Promise<{
    totalSchedules: number;
    totalHours: number;
    leaveCount: number;
    byStatus: { status: string; count: number }[];
    byStaff: { staff: any; hours: number; days: number }[];
  }> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const [stats] = await this.scheduleModel.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: null,
                totalSchedules: { $sum: 1 },
                totalHours: { $sum: '$totalHours' },
                leaveCount: {
                  $sum: { $cond: ['$isLeave', 1, 0] },
                },
              },
            },
          ],
          byStatus: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 },
              },
            },
            {
              $project: {
                _id: 0,
                status: '$_id',
                count: 1,
              },
            },
          ],
          byStaff: [
            {
              $group: {
                _id: '$staff',
                hours: { $sum: '$totalHours' },
                days: { $sum: 1 },
              },
            },
            {
              $lookup: {
                from: 'staff',
                localField: '_id',
                foreignField: '_id',
                as: 'staffInfo',
              },
            },
            {
              $unwind: '$staffInfo',
            },
            {
              $project: {
                _id: 0,
                staff: {
                  id: '$_id',
                  name: '$staffInfo.name',
                  email: '$staffInfo.email',
                },
                hours: 1,
                days: 1,
              },
            },
          ],
        },
      },
    ]);

    const totals = stats.totals[0] || {
      totalSchedules: 0,
      totalHours: 0,
      leaveCount: 0,
    };

    return {
      ...totals,
      byStatus: stats.byStatus,
      byStaff: stats.byStaff,
    };
  }

  async getTodaySchedules(): Promise<StaffSchedule[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.scheduleModel
      .find({
        date: { $gte: today, $lt: tomorrow },
      })
      .populate('staff', 'name email phone role')
      .sort({ startTime: 1 })
      .exec();
  }
}
