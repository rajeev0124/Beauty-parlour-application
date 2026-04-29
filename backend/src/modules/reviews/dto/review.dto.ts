import { IsString, IsNumber, IsOptional, IsMongoId, Min, Max } from 'class-validator';

export class CreateReviewDto {
  @IsMongoId()
  @IsOptional()
  serviceId?: string;

  @IsString()
  @IsOptional()
  serviceName?: string;

  @IsMongoId()
  @IsOptional()
  staffId?: string;

  @IsString()
  @IsOptional()
  staffName?: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  comment: string;
}

export class ReplyReviewDto {
  @IsString()
  adminReply: string;
}
