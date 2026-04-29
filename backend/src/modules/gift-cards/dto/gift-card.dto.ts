import { IsString, IsNumber, IsOptional, IsEmail, IsEnum, Min, Max, MaxLength } from 'class-validator';

export class CreateGiftCardDto {
  @IsNumber()
  @Min(100)
  @Max(50000)
  amount: number;

  @IsString()
  recipientName: string;

  @IsEmail()
  recipientEmail: string;

  @IsOptional()
  @IsString()
  recipientPhone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  personalMessage?: string;

  @IsOptional()
  @IsEnum(['email', 'sms', 'print'])
  deliveryMethod?: string;

  @IsOptional()
  design?: {
    template?: string;
    color?: string;
    image?: string;
  };
}

export class RedeemGiftCardDto {
  @IsString()
  code: string;

  @IsNumber()
  @Min(1)
  amount: number;

  @IsOptional()
  @IsString()
  orderId?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class CheckBalanceDto {
  @IsString()
  code: string;
}
