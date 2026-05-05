import {
  IsString,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsNumber,
} from 'class-validator';

export class AddToWishlistDto {
  @IsEnum(['product', 'service', 'package'])
  itemType: string;

  @IsString()
  itemId: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  priceAtAdd?: number;

  @IsOptional()
  @IsBoolean()
  notifyOnSale?: boolean;
}

export class RemoveFromWishlistDto {
  @IsString()
  itemId: string;
}

export class UpdateWishlistDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class UpdateWishlistItemDto {
  @IsString()
  itemId: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsEnum(['low', 'medium', 'high'])
  priority?: string;

  @IsOptional()
  @IsBoolean()
  notifyOnSale?: boolean;
}
