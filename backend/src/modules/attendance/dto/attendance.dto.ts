import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsObject,
  IsEnum,
  Min,
  Max,
} from 'class-validator';

export class CheckInDto {
  @IsOptional()
  @IsObject()
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CheckOutDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(120)
  breakMinutes?: number;

  @IsOptional()
  @IsObject()
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };

  @IsOptional()
  @IsString()
  notes?: string;
}

export class RequestLeaveDto {
  @IsString()
  date: string; // YYYY-MM-DD

  @IsString()
  @IsEnum([
    'sick',
    'casual',
    'annual',
    'emergency',
    'maternity',
    'paternity',
    'unpaid',
  ])
  leaveType: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class ApproveLeaveDto {
  @IsBoolean()
  approved: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class GetAttendanceDto {
  @IsOptional()
  @IsString()
  staffId?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  status?: string;
}

export class UpdateAttendanceDto {
  @IsOptional()
  @IsString()
  @IsEnum(['present', 'absent', 'half-day', 'leave', 'holiday'])
  status?: string;

  @IsOptional()
  @IsNumber()
  workingHours?: number;

  @IsOptional()
  @IsNumber()
  overtimeHours?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
