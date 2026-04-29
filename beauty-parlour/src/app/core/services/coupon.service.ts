import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Coupon {
  _id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  validFrom: Date;
  validUntil: Date;
  usageLimit?: number;
  usedCount: number;
  applicableServices?: string[];
  applicableProducts?: string[];
  isActive: boolean;
  createdAt: Date;
}

export interface CouponValidation {
  valid: boolean;
  discount: number;
  message: string;
  coupon?: Coupon;
}

@Injectable({ providedIn: 'root' })
export class CouponService {
  private readonly apiUrl = `${environment.apiUrl}/coupons`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Coupon[]> {
    return this.http.get<Coupon[]>(this.apiUrl);
  }

  getActive(): Observable<Coupon[]> {
    return this.http.get<Coupon[]>(`${this.apiUrl}/active`);
  }

  getById(id: string): Observable<Coupon> {
    return this.http.get<Coupon>(`${this.apiUrl}/${id}`);
  }

  create(coupon: Partial<Coupon>): Observable<Coupon> {
    return this.http.post<Coupon>(this.apiUrl, coupon);
  }

  update(id: string, coupon: Partial<Coupon>): Observable<Coupon> {
    return this.http.put<Coupon>(`${this.apiUrl}/${id}`, coupon);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  validate(code: string, orderTotal: number, items?: { type: string; id: string }[]): Observable<CouponValidation> {
    return this.http.post<CouponValidation>(`${this.apiUrl}/validate`, { code, orderTotal, items });
  }
}
