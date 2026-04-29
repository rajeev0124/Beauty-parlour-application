import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsBoolean,
  IsObject,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class CustomFilterDto {
  @IsOptional()
  minPurchases?: number;

  @IsOptional()
  maxPurchases?: number;

  @IsOptional()
  lastVisitDays?: number;

  @IsOptional()
  @IsArray()
  membershipTier?: string[];

  @IsOptional()
  @IsArray()
  tags?: string[];
}

class TargetAudienceDto {
  @IsOptional()
  @IsEnum(['all', 'vip', 'new', 'inactive', 'custom'])
  segment?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CustomFilterDto)
  customFilter?: CustomFilterDto;

  @IsOptional()
  @IsArray()
  customerIds?: string[];
}

export class CreateCampaignDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['email', 'sms', 'push', 'combined'])
  type?: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  smsContent?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => TargetAudienceDto)
  targetAudience?: TargetAudienceDto;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsString()
  couponCode?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @IsOptional()
  @IsString()
  recurringSchedule?: string;
}

export class UpdateCampaignDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['email', 'sms', 'push', 'combined'])
  type?: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  smsContent?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => TargetAudienceDto)
  targetAudience?: TargetAudienceDto;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsString()
  couponCode?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];
}

export class QueryCampaignsDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;
}
