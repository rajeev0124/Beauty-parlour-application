import {
  IsString,
  IsNumber,
  IsDateString,
  IsArray,
  IsOptional,
  IsBoolean,
  IsEnum,
} from 'class-validator';

export class CreateCouponDto {
  @IsString()
  code: string;

  @IsString()
  description: string;

  @IsEnum(['percentage', 'fixed'])
  discountType: string;

  @IsNumber()
  discountValue: number;

  @IsNumber()
  @IsOptional()
  minOrderAmount?: number;

  @IsNumber()
  @IsOptional()
  maxDiscount?: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsNumber()
  @IsOptional()
  maxUsage?: number;

  @IsNumber()
  @IsOptional()
  perUserLimit?: number;

  @IsArray()
  @IsOptional()
  applicableOn?: string[];
}

export class UpdateCouponDto {
  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  discountValue?: number;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class ValidateCouponDto {
  @IsString()
  code: string;

  @IsNumber()
  orderAmount: number;

  @IsString()
  @IsOptional()
  type?: string; // 'service' or 'product'
}
