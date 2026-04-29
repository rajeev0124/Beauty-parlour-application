import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Review {
  _id: string;
  user: { _id: string; name: string; profileImage?: string };
  service?: { _id: string; name: string };
  product?: { _id: string; name: string };
  appointment?: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  status: 'pending' | 'approved' | 'rejected';
  reply?: string;
  repliedAt?: Date;
  createdAt: Date;
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: { rating: number; count: number }[];
  pendingCount: number;
}

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly apiUrl = `${environment.apiUrl}/reviews`;

  constructor(private http: HttpClient) {}

  // Admin methods
  getAll(status?: string): Observable<Review[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<Review[]>(this.apiUrl, { params });
  }

  getStats(): Observable<ReviewStats> {
    return this.http.get<ReviewStats>(`${this.apiUrl}/stats`);
  }

  approve(id: string): Observable<Review> {
    return this.http.put<Review>(`${this.apiUrl}/${id}/approve`, {});
  }

  reject(id: string): Observable<Review> {
    return this.http.put<Review>(`${this.apiUrl}/${id}/reject`, {});
  }

  reply(id: string, reply: string): Observable<Review> {
    return this.http.put<Review>(`${this.apiUrl}/${id}/reply`, { reply });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Public methods
  getPublicReviews(serviceId?: string, productId?: string): Observable<Review[]> {
    let params = new HttpParams();
    if (serviceId) params = params.set('serviceId', serviceId);
    if (productId) params = params.set('productId', productId);
    return this.http.get<Review[]>(`${this.apiUrl}/public`, { params });
  }

  // Customer methods
  create(review: { rating: number; comment: string; title?: string; serviceId?: string; productId?: string; appointmentId?: string }): Observable<Review> {
    return this.http.post<Review>(this.apiUrl, review);
  }
}
