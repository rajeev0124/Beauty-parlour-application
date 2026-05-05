import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { User, UserDocument } from '../../schemas/user.schema';
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  RefreshTokenDto,
} from './dto/auth.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existing = await this.userModel.findOne({ email: registerDto.email });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    if (registerDto.password.length < 8) {
      throw new BadRequestException(
        'Password must be at least 8 characters long',
      );
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 12);
    
    // Generate email verification token
    const verificationToken = randomBytes(32).toString('hex');
    const hashedVerificationToken = await bcrypt.hash(verificationToken, 12);

    const user = await this.userModel.create({
      name: registerDto.name,
      email: registerDto.email,
      phone: registerDto.phone,
      password: hashedPassword,
      role: 'customer',
      emailVerificationToken: hashedVerificationToken,
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      emailVerified: false,
    });

    // Send verification email
    const verificationLink = `http://localhost:4200/verify-email?token=${verificationToken}`;
    await this.emailService.sendEmail({
      to: user.email,
      subject: 'Verify your Beauty Parlour email',
      html: `Click this link to verify: <a href="${verificationLink}">${verificationLink}</a>`,
    });

    const tokens = await this.generateTokens(user);
    await this.updateRefreshToken(user._id.toString(), tokens.refreshToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: this.sanitizeUser(user),
      message: 'Verification email sent',
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userModel.findOne({ email: loginDto.email });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if account is locked
    if (user.lockedUntil && new Date() < user.lockedUntil) {
      const minutesRemaining = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / 60000,
      );
      throw new UnauthorizedException(
        `Account locked. Try again in ${minutesRemaining} minutes.`,
      );
    }

    // Reset lock if time has passed
    if (user.lockedUntil && new Date() >= user.lockedUntil) {
      user.failedLoginAttempts = 0;
      user.lockedUntil = null as any;
    }

    if (user.status === 'blocked') {
      throw new UnauthorizedException('Account is blocked. Contact admin.');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      // Track failed login attempt
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      user.lastFailedLogin = new Date();

      // Lock account after 5 failed attempts
      if (user.failedLoginAttempts >= 5) {
        user.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
        await user.save();
        throw new UnauthorizedException(
          'Too many failed attempts. Account locked for 30 minutes.',
        );
      }

      await user.save();
      throw new UnauthorizedException('Invalid email or password');
    }

    // Successful login - reset failed attempts
    user.failedLoginAttempts = 0;
    user.lastFailedLogin = null as any;
    user.lockedUntil = null as any;

    const tokens = await this.generateTokens(user);
    await this.updateRefreshToken(user._id.toString(), tokens.refreshToken);

    // Record session info
    const sessionData = {
      device: loginDto.device || 'Unknown Device',
      ip: loginDto.ip || '0.0.0.0',
      lastActive: new Date(),
      sessionId: randomBytes(16).toString('hex'),
    };
    await this.userModel.findByIdAndUpdate(user._id, {
      $push: { activeSessions: { $each: [sessionData], $slice: -5 } },
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: this.sanitizeUser(user),
      sessionId: sessionData.sessionId,
    };
  }

  async logout(userId: string) {
    await this.userModel.findByIdAndUpdate(userId, { refreshToken: null });
    return { message: 'Logged out successfully' };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      const payload = await this.jwtService.verifyAsync(
        refreshTokenDto.refreshToken,
        {
          secret:
            process.env.JWT_REFRESH_SECRET || 'beauty-parlour-refresh-secret',
        },
      );

      const user = await this.userModel.findById(payload.sub);
      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const isValid = await bcrypt.compare(
        refreshTokenDto.refreshToken,
        user.refreshToken,
      );
      if (!isValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = await this.generateTokens(user);
      await this.updateRefreshToken(user._id.toString(), tokens.refreshToken);

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.userModel.findOne({
      email: forgotPasswordDto.email,
    });
    if (!user) {
      // Show error that email doesn't exist
      throw new BadRequestException(
        'This email address is not registered. Please check your email or create a new account.',
      );
    }

    const resetToken = randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(resetToken, 12);

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    // Send password reset email
    const _emailSent = await this.emailService.sendPasswordReset(
      user.email,
      resetToken,
    );

    // In development/testing mode (when SMTP not configured), return the reset link
    const resetLink = `http://localhost:4200/reset-password?token=${resetToken}`;
    const isDevelopment =
      !process.env.SMTP_USER || process.env.SMTP_USER.includes('your-email');

    if (isDevelopment) {
      return {
        message: 'Password reset link has been sent to your email',
        // DEV ONLY: Reset link for testing (remove in production)
        devResetLink: resetLink,
      };
    }

    return { message: 'Password reset link has been sent to your email' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    // Find all users with non-expired reset tokens
    const users = await this.userModel.find({
      resetPasswordExpires: { $gt: new Date() },
      resetPasswordToken: { $ne: null },
    });

    // Find the user whose token matches
    let matchedUser: UserDocument | null = null;
    for (const user of users) {
      const isValid = await bcrypt.compare(
        resetPasswordDto.token,
        user.resetPasswordToken,
      );
      if (isValid) {
        matchedUser = user;
        break;
      }
    }

    if (!matchedUser) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Update password and clear reset token
    matchedUser.password = await bcrypt.hash(resetPasswordDto.newPassword, 12);
    matchedUser.resetPasswordToken = null as any;
    matchedUser.resetPasswordExpires = null as any;
    await matchedUser.save();

    return {
      message:
        'Password reset successful. You can now sign in with your new password.',
    };
  }

  async getProfile(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .select(
        '-password -refreshToken -resetPasswordToken -resetPasswordExpires',
      );
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  async verifyEmail(token: string) {
    // Find users with non-expired verification tokens
    const users = await this.userModel.find({
      emailVerificationExpires: { $gt: new Date() },
      emailVerificationToken: { $ne: null },
    });

    // Find the user whose token matches
    let matchedUser: UserDocument | null = null;
    for (const user of users) {
      const isValid = await bcrypt.compare(token, user.emailVerificationToken);
      if (isValid) {
        matchedUser = user;
        break;
      }
    }

    if (!matchedUser) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    matchedUser.emailVerified = true;
    matchedUser.emailVerificationToken = null as any;
    matchedUser.emailVerificationExpires = null as any;
    await matchedUser.save();

    return {
      message: 'Email verified successfully',
      emailVerified: true,
    };
  }

  private async generateTokens(user: UserDocument) {
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET || 'beauty-parlour-secret-key',
        expiresIn: '7d',
      }),
      this.jwtService.signAsync(payload, {
        secret:
          process.env.JWT_REFRESH_SECRET || 'beauty-parlour-refresh-secret',
        expiresIn: '30d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedToken = await bcrypt.hash(refreshToken, 12);
    await this.userModel.findByIdAndUpdate(userId, {
      refreshToken: hashedToken,
    });
  }

  async getActiveSessions(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      sessions: user.activeSessions.map((session: any) => ({
        id: session.sessionId,
        device: session.device,
        ip: session.ip,
        location: this.getLocationFromIP(session.ip),
        lastActive: session.lastActive,
        current: false,
      })),
    };
  }

  async toggleTwoFactor(userId: string, enabled: boolean) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (enabled) {
      // Generate TOTP secret when enabling 2FA
      const secret = speakeasy.generateSecret({
        name: `Beauty Parlour (${user.email})`,
        issuer: 'Beauty Parlour',
        length: 32,
      });

      user.twoFactorSecret = secret.base32;
      user.is2FAEnabled = false; // Not enabled until user verifies code

      // Generate QR code for authenticator app
      const qrCode = await QRCode.toDataURL(secret.otpauth_url);

      await user.save();

      return {
        message: 'TOTP setup initiated. Scan QR code with authenticator app.',
        is2FAEnabled: false,
        qrCode,
        secret: secret.base32, // For manual entry if QR scan fails
        tempSecret: secret.base32,
      };
    } else {
      // Disable 2FA
      user.is2FAEnabled = false;
      user.twoFactorSecret = null as any;
      await user.save();

      return {
        message: '2FA has been disabled successfully',
        is2FAEnabled: false,
      };
    }
  }

  async verifyTwoFactorSetup(userId: string, code: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.twoFactorSecret) {
      throw new BadRequestException('2FA not initialized');
    }

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 2, // Allow 30 seconds window on each side
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid TOTP code');
    }

    user.is2FAEnabled = true;
    await user.save();

    return {
      message: '2FA has been enabled successfully',
      is2FAEnabled: true,
    };
  }

  async verifyTwoFactor(userId: string, code: string): Promise<boolean> {
    const user = await this.userModel.findById(userId);
    if (!user || !user.is2FAEnabled || !user.twoFactorSecret) {
      return false;
    }

    return speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 2,
    });
  }

  async terminateSession(userId: string, sessionId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    user.activeSessions = user.activeSessions.filter(
      (session: any) => session.sessionId !== sessionId,
    );
    await user.save();

    return {
      message: 'Session terminated successfully',
    };
  }

  private getLocationFromIP(ip: string): string {
    // Simple IP-to-location mapping (in production, use MaxMind or similar)
    const locations: { [key: string]: string } = {
      '127.0.0.1': 'Local Machine',
      '::1': 'Local Machine',
      '0.0.0.0': 'Unknown Location',
    };
    return locations[ip] || 'Remote Location';
  }

  private sanitizeUser(user: UserDocument) {
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profileImage: user.profileImage,
      address: user.address,
      status: user.status,
      createdAt: (user as any).createdAt,
    };
  }
}
