import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';

@Injectable()
export class CsrfService {
  private tokens = new Map<string, { token: string; expiresAt: number }>();
  private readonly TOKEN_EXPIRY = 1000 * 60 * 60; // 1 hour

  generateToken(): string {
    const token = randomBytes(32).toString('hex');
    this.tokens.set(token, {
      token,
      expiresAt: Date.now() + this.TOKEN_EXPIRY,
    });

    // Clean up expired tokens
    this.cleanupExpiredTokens();

    return token;
  }

  validateToken(token: string): boolean {
    const entry = this.tokens.get(token);

    if (!entry) {
      return false;
    }

    if (entry.expiresAt < Date.now()) {
      this.tokens.delete(token);
      return false;
    }

    // Token is single-use
    this.tokens.delete(token);
    return true;
  }

  private cleanupExpiredTokens(): void {
    const now = Date.now();
    for (const [key, value] of this.tokens.entries()) {
      if (value.expiresAt < now) {
        this.tokens.delete(key);
      }
    }
  }
}
