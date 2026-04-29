import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LoyaltyConfig {
  pointsPerRupee: number;
  minRedeemPoints: number;
  pointValue: number; // Value of 1 point in rupees
  welcomeBonus: number;
  referralBonus: number;
  birthdayBonus: number;
  tiers: LoyaltyTier[];
}

export interface LoyaltyTier {
  name: string;
  minPoints: number;
  benefits: string[];
  multiplier: number;
}

export interface LoyaltyAccount {
  _id: string;
  user: { _id: string; name: string; email: string };
  points: number;
  lifetimePoints: number;
  tier: string;
  referralCode: string;
  referredBy?: string;
  createdAt: Date;
}

export interface LoyaltyTransaction {
  _id: string;
  user: string;
  type: 'earn' | 'redeem' | 'bonus' | 'expire' | 'adjustment';
  points: number;
  description: string;
  reference?: { type: string; id: string };
  expiresAt?: Date;
  createdAt: Date;
}

export interface LeaderboardEntry {
  rank: number;
  user: { _id: string; name: string; profileImage?: string };
  points: number;
  tier: string;
}

@Injectable({ providedIn: 'root' })
export class LoyaltyService {
  private readonly apiUrl = `${environment.apiUrl}/loyalty`;

  constructor(private http: HttpClient) {}

  // Config
  getConfig(): Observable<LoyaltyConfig> {
    return this.http.get<LoyaltyConfig>(`${this.apiUrl}/config`);
  }

  // Account
  getMyAccount(): Observable<LoyaltyAccount> {
    return this.http.get<LoyaltyAccount>(`${this.apiUrl}/account`);
  }

  getAccountByUser(userId: string): Observable<LoyaltyAccount> {
    return this.http.get<LoyaltyAccount>(`${this.apiUrl}/account/${userId}`);
  }

  // History
  getHistory(filters?: { type?: string; startDate?: string; endDate?: string }): Observable<LoyaltyTransaction[]> {
    let params = new HttpParams();
    if (filters?.type) params = params.set('type', filters.type);
    if (filters?.startDate) params = params.set('startDate', filters.startDate);
    if (filters?.endDate) params = params.set('endDate', filters.endDate);
    return this.http.get<LoyaltyTransaction[]>(`${this.apiUrl}/history`, { params });
  }

  // Actions
  redeemPoints(points: number, description?: string): Observable<{ success: boolean; message: string; remainingPoints: number }> {
    return this.http.post<{ success: boolean; message: string; remainingPoints: number }>(`${this.apiUrl}/redeem`, { points, description });
  }

  earnPoints(userId: string, points: number, description: string, reference?: { type: string; id: string }): Observable<LoyaltyTransaction> {
    return this.http.post<LoyaltyTransaction>(`${this.apiUrl}/earn`, { userId, points, description, reference });
  }

  addBonus(userId: string, points: number, reason: string): Observable<LoyaltyTransaction> {
    return this.http.post<LoyaltyTransaction>(`${this.apiUrl}/bonus`, { userId, points, reason });
  }

  applyReferral(referralCode: string): Observable<{ success: boolean; message: string; bonusPoints: number }> {
    return this.http.post<{ success: boolean; message: string; bonusPoints: number }>(`${this.apiUrl}/referral`, { referralCode });
  }

  // Leaderboard
  getLeaderboard(limit: number = 10): Observable<LeaderboardEntry[]> {
    return this.http.get<LeaderboardEntry[]>(`${this.apiUrl}/leaderboard`, { params: { limit: limit.toString() } });
  }
}
