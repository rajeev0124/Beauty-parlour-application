import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
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

  // Config - maps backend response to frontend format
  getConfig(): Observable<LoyaltyConfig> {
    return this.http.get<any>(`${this.apiUrl}/config`).pipe(
      map((res: any) => {
        // Map backend format to frontend format
        const tiersObj = res.TIERS || res.tiers || {};
        const tiersArray: LoyaltyTier[] = Object.entries(tiersObj).map(([name, data]: [string, any]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize first letter
          minPoints: data.min || data.minPoints || 0,
          multiplier: data.multiplier || 1,
          benefits: typeof data.benefits === 'string' 
            ? data.benefits.split(/[,\n]/).map((b: string) => b.trim()).filter((b: string) => b)
            : (data.benefits || [])
        }));
        
        // Sort tiers by minPoints
        tiersArray.sort((a, b) => a.minPoints - b.minPoints);

        return {
          pointsPerRupee: res.POINTS_PER_RUPEE || res.pointsPerRupee || 1,
          minRedeemPoints: res.MIN_REDEMPTION_POINTS || res.minRedeemPoints || 100,
          pointValue: res.POINT_VALUE || res.pointValue || 0.25,
          welcomeBonus: res.FIRST_APPOINTMENT_BONUS || res.welcomeBonus || 50,
          referralBonus: res.REFERRAL_BONUS || res.referralBonus || 100,
          birthdayBonus: res.BIRTHDAY_BONUS || res.birthdayBonus || 50,
          tiers: tiersArray
        };
      })
    );
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

  // Leaderboard - maps backend response to frontend format
  getLeaderboard(limit: number = 10): Observable<LeaderboardEntry[]> {
    return this.http.get<any>(`${this.apiUrl}/leaderboard`, { params: { limit: limit.toString() } }).pipe(
      map((response: any) => {
        // Handle both array and object with value property
        const entries = Array.isArray(response) ? response : (response.value || response.data || []);
        
        return entries.map((entry: any, index: number) => ({
          rank: entry.rank || index + 1,
          user: entry.user || { _id: entry._id, name: `User ${index + 1}`, profileImage: null },
          points: entry.points || entry.totalPoints || 0,
          tier: entry.tier ? (entry.tier.charAt(0).toUpperCase() + entry.tier.slice(1)) : 'Bronze'
        }));
      })
    );
  }
}
