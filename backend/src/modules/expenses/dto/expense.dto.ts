import {
  IsString,
  IsNumber,
  IsDateString,
  IsOptional,
  IsBoolean,
  IsEnum,
} from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  title: string;

  @IsEnum([
    'rent',
    'utilities',
    'salary',
    'supplies',
    'equipment',
    'marketing',
    'maintenance',
    'other',
  ])
  category: string;

  @IsNumber()
  amount: number;

  @IsDateString()
  date: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  vendor?: string;

  @IsString()
  @IsOptional()
  receiptUrl?: string;

  @IsEnum(['cash', 'card', 'upi', 'bank_transfer'])
  @IsOptional()
  paymentMethod?: string;

  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;

  @IsEnum(['daily', 'weekly', 'monthly', 'yearly'])
  @IsOptional()
  recurringFrequency?: string;
}

export class UpdateExpenseDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  description?: string;
}
