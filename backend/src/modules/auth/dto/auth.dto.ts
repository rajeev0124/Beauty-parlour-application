import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
  IsOptional,
} from 'class-validator';

// Email regex that accepts all valid email formats including .test TLD for testing
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @Matches(EMAIL_REGEX, { message: 'Email must be a valid email address' })
  email: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^[0-9]{10}$/, { message: 'Phone must be a valid 10-digit number' })
  phone: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  // Role is not allowed from client - always defaults to 'customer'
  // Admin roles can only be assigned through backend seeding or superadmin
}

export class LoginDto {
  @IsNotEmpty()
  @Matches(EMAIL_REGEX, { message: 'Email must be a valid email address' })
  email: string;

  @IsNotEmpty()
  password: string;

  @IsOptional()
  @IsString()
  device?: string;

  @IsOptional()
  @IsString()
  ip?: string;
}

export class ForgotPasswordDto {
  @IsNotEmpty()
  @Matches(EMAIL_REGEX, { message: 'Email must be a valid email address' })
  email: string;
}

export class ResetPasswordDto {
  @IsNotEmpty()
  @IsString()
  token: string;

  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}

export class RefreshTokenDto {
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}
