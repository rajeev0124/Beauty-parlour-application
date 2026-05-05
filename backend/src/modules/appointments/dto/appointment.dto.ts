import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { IsNotPastDate } from '../../../common/decorators/is-not-past-date.decorator';

export class CreateAppointmentDto {
  @IsOptional() // UserId comes from JWT token, not from client
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  userName?: string;

  @IsNotEmpty()
  @IsString()
  serviceId: string;

  @IsOptional()
  @IsString()
  serviceName?: string;

  @IsOptional()
  @IsString()
  staffId?: string;

  @IsOptional()
  @IsString()
  staffName?: string;

  @IsNotEmpty()
  @IsString()
  @IsNotPastDate({ message: 'Cannot book appointments in the past' })
  date: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/, {
    message: 'Time must be in format HH:MM AM/PM',
  })
  time: string;

  @IsOptional()
  @IsString()
  notes?: string;

  // Note: status is NOT included here - new appointments always start as 'pending'
  // Status changes are handled through the updateStatus endpoint
}

export class UpdateAppointmentDto {
  @IsOptional()
  @IsString()
  serviceId?: string;

  @IsOptional()
  @IsString()
  serviceName?: string;

  @IsOptional()
  @IsString()
  staffId?: string;

  @IsOptional()
  @IsString()
  staffName?: string;

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  time?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  status?: string;
}

export class UpdateStatusDto {
  @IsNotEmpty()
  @IsString()
  status: string;
}
