import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import * as crypto from 'crypto';

// OTP configuration
const OTP_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 3;

interface OTPRecord {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  otp: string;
  purpose: string;
  expiresAt: Date;
  attempts: number;
  verified: boolean;
  createdAt: Date;
}

@Injectable()
export class TwoFactorService {
  private readonly logger = new Logger(TwoFactorService.name);

  // In-memory OTP storage (use Redis in production)
  private otpStore = new Map<string, OTPRecord>();

  /**
   * Generate a 6-digit OTP
   */
  generateOTP(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Create and store OTP for a user
   */
  createOTP(
    userId: string,
    purpose: 'login' | 'transaction' | 'password_reset',
  ): string {
    const otp = this.generateOTP();
    const key = `${userId}:${purpose}`;

    const record: OTPRecord = {
      userId: new Types.ObjectId(userId),
      otp: this.hashOTP(otp),
      purpose,
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
      attempts: 0,
      verified: false,
      createdAt: new Date(),
    };

    this.otpStore.set(key, record);

    this.logger.debug(`OTP created for user ${userId}, purpose: ${purpose}`);
    return otp;
  }

  /**
   * Verify OTP
   */
  verifyOTP(userId: string, otp: string, purpose: string): boolean {
    const key = `${userId}:${purpose}`;
    const record = this.otpStore.get(key);

    if (!record) {
      throw new BadRequestException('No OTP found. Please request a new one.');
    }

    if (record.verified) {
      throw new BadRequestException(
        'OTP already used. Please request a new one.',
      );
    }

    if (new Date() > record.expiresAt) {
      this.otpStore.delete(key);
      throw new BadRequestException('OTP expired. Please request a new one.');
    }

    if (record.attempts >= MAX_ATTEMPTS) {
      this.otpStore.delete(key);
      throw new BadRequestException(
        'Too many failed attempts. Please request a new OTP.',
      );
    }

    const isValid = this.compareOTP(otp, record.otp);

    if (!isValid) {
      record.attempts++;
      throw new BadRequestException(
        `Invalid OTP. ${MAX_ATTEMPTS - record.attempts} attempts remaining.`,
      );
    }

    record.verified = true;
    this.otpStore.delete(key); // Remove after successful verification

    this.logger.debug(`OTP verified for user ${userId}, purpose: ${purpose}`);
    return true;
  }

  /**
   * Check if user has 2FA enabled
   */

  is2FAEnabled(_userId: string): boolean {
    // For now, 2FA is enabled for admin roles by default
    // Can be extended to store user preference in database
    return false; // Override in production
  }

  /**
   * Enable 2FA for user
   */
  enable2FA(userId: string): { secret: string; qrCode: string } {
    // Generate TOTP secret for authenticator apps
    const secret = this.generateTOTPSecret();
    const qrCode = this.generateQRCodeData(secret, userId);

    // Store secret in user profile (implement in user service)

    return { secret, qrCode };
  }

  /**
   * Generate TOTP secret for authenticator apps
   */
  private generateTOTPSecret(): string {
    return crypto
      .randomBytes(20)
      .toString('hex')
      .substring(0, 16)
      .toUpperCase();
  }

  /**
   * Generate QR code data for authenticator apps
   */
  private generateQRCodeData(secret: string, userId: string): string {
    const issuer = 'BeautyParlour';
    return `otpauth://totp/${issuer}:${userId}?secret=${secret}&issuer=${issuer}`;
  }

  /**
   * Hash OTP for secure storage
   */
  private hashOTP(otp: string): string {
    return crypto.createHash('sha256').update(otp).digest('hex');
  }

  /**
   * Compare OTP with hash
   */
  private compareOTP(otp: string, hash: string): boolean {
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    return otpHash === hash;
  }

  /**
   * Clean up expired OTPs (run periodically)
   */
  cleanupExpiredOTPs(): void {
    const now = new Date();
    for (const [key, record] of this.otpStore.entries()) {
      if (record.expiresAt < now) {
        this.otpStore.delete(key);
      }
    }
  }
}
