import { IsNumber, IsString, IsOptional, IsBoolean, IsEnum, Min, Max, IsArray, IsObject, MaxLength } from 'class-validator';

export class CreateFeedbackDto {
  @IsEnum(['appointment', 'order', 'general', 'service', 'staff'])
  type: string;

  @IsOptional()
  @IsString()
  referenceId?: string;

  @IsOptional()
  @IsString()
  serviceId?: string;

  @IsOptional()
  @IsString()
  staffId?: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  overallRating: number;

  @IsOptional()
  @IsObject()
  ratings?: {
    serviceQuality?: number;
    staffBehavior?: number;
    cleanliness?: number;
    valueForMoney?: number;
    waitTime?: number;
    ambience?: number;
  };

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;
}

export class RespondToFeedbackDto {
  @IsString()
  @MaxLength(500)
  response: string;
}

export class UpdateFeedbackStatusDto {
  @IsEnum(['pending', 'reviewed', 'responded', 'resolved'])
  status: string;
}
