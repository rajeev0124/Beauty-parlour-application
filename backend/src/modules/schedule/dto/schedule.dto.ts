import {
  IsString,
  IsBoolean,
  IsOptional,
  IsArray,
  IsEnum,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class BreakDto {
  @IsString()
  breakStart: string;

  @IsString()
  breakEnd: string;

  @IsOptional()
  @IsString()
  breakType?: string;
}

export class RecurringConfigDto {
  @IsEnum(['daily', 'weekly', 'monthly'])
  pattern: string;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  daysOfWeek?: number[];

  @IsOptional()
  endDate?: Date;
}

export class CreateScheduleDto {
  @IsString()
  staff: string;

  date: Date;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsOptional()
  @IsBoolean()
  isLeave?: boolean;

  @IsOptional()
  @IsEnum(['scheduled', 'working', 'completed', 'absent', 'leave'])
  status?: string;

  @IsOptional()
  @IsString()
  leaveType?: string;

  @IsOptional()
  @IsString()
  leaveReason?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  isHoliday?: boolean;

  @IsOptional()
  @IsString()
  holidayName?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BreakDto)
  breaks?: BreakDto[];

  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => RecurringConfigDto)
  recurringConfig?: RecurringConfigDto;
}

export class UpdateScheduleDto {
  @IsOptional()
  @IsString()
  staff?: string;

  @IsOptional()
  date?: Date;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsBoolean()
  isLeave?: boolean;

  @IsOptional()
  @IsEnum(['scheduled', 'working', 'completed', 'absent', 'leave'])
  status?: string;

  @IsOptional()
  @IsString()
  leaveType?: string;

  @IsOptional()
  @IsString()
  leaveReason?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  isHoliday?: boolean;

  @IsOptional()
  @IsString()
  holidayName?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BreakDto)
  breaks?: BreakDto[];

  @IsOptional()
  checkInTime?: Date;

  @IsOptional()
  checkOutTime?: Date;
}

export class BulkScheduleDto {
  @IsArray()
  @IsString({ each: true })
  staffIds: string[];

  startDate: Date;
  endDate: Date;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  daysOfWeek?: number[]; // 0-6

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BreakDto)
  breaks?: BreakDto[];
}

export class LeaveRequestDto {
  @IsString()
  staff: string;

  @IsOptional()
  @Type(() => Date)
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  endDate?: Date;

  @IsString()
  leaveType: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
