import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface GiftCard {
  _id: string;
  code: string;
  amount: number;
  balance: number;
  purchasedBy?: string;
  purchaserName?: string;
  recipientName: string;
  recipientEmail: string;
  recipientPhone?: string;
  personalMessage?: string;
  status: 'active' | 'partially_used' | 'exhausted' | 'expired' | 'cancelled';
  expiresAt: Date;
  isDelivered: boolean;
  deliveryMethod: 'email' | 'sms' | 'print';
  usageHistory: {
    date: Date;
    amount: number;
    orderId?: string;
    description: string;
  }[];
  design?: {
    template?: string;
    color?: string;
    image?: string;
  };
  createdAt: Date;
}

export interface CreateGiftCardDto {
  amount: number;
  recipientName: string;
  recipientEmail: string;
  recipientPhone?: string;
  personalMessage?: string;
  deliveryMethod?: 'email' | 'sms' | 'print';
  design?: {
    template?: string;
    color?: string;
    image?: string;
  };
}

export interface GiftCardBalance {
  code: string;
  originalAmount: number;
  balance: number;
  status: string;
  expiresAt: Date;
  isValid: boolean;
}

export interface GiftCardStats {
  totalSold: number;
  totalValue: number;
  totalRedeemed: number;
  activeCards: number;
  expiredCards: number;
}

@Injectable({
  providedIn: 'root'
})
export class GiftCardService {
  private readonly apiUrl = `${environment.apiUrl}/gift-cards`;

  constructor(private http: HttpClient) {}

  // Public
  checkBalance(code: string): Observable<GiftCardBalance> {
    return this.http.post<GiftCardBalance>(`${this.apiUrl}/check-balance`, { code });
  }

  // Customer
  purchase(dto: CreateGiftCardDto): Observable<GiftCard> {
    return this.http.post<GiftCard>(`${this.apiUrl}/purchase`, dto);
  }

  redeem(code: string, amount: number, orderId?: string): Observable<{
    success: boolean;
    message: string;
    remainingBalance: number;
    amountUsed: number;
  }> {
    return this.http.post<any>(`${this.apiUrl}/redeem`, { code, amount, orderId });
  }

  getMyPurchases(): Observable<GiftCard[]> {
    return this.http.get<GiftCard[]>(`${this.apiUrl}/my-purchases`);
  }

  getMyReceived(): Observable<GiftCard[]> {
    return this.http.get<GiftCard[]>(`${this.apiUrl}/my-received`);
  }

  // Admin
  getAll(params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Observable<GiftCard[]> {
    return this.http.get<GiftCard[]>(this.apiUrl, { params: params as any });
  }

  getStats(): Observable<GiftCardStats> {
    return this.http.get<GiftCardStats>(`${this.apiUrl}/stats`);
  }

  getByCode(code: string): Observable<GiftCard> {
    return this.http.get<GiftCard>(`${this.apiUrl}/${code}`);
  }

  cancel(code: string, reason?: string): Observable<GiftCard> {
    return this.http.post<GiftCard>(`${this.apiUrl}/${code}/cancel`, { reason });
  }

  resend(code: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<any>(`${this.apiUrl}/${code}/resend`, {});
  }
}
