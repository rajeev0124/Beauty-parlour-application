import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Feedback {
  _id: string;
  userId: string;
  userName: string;
  type: 'appointment' | 'order' | 'general' | 'service' | 'staff';
  referenceId?: string;
  serviceId?: string;
  staffId?: string;
  staffName?: string;
  overallRating: number;
  ratings?: {
    serviceQuality?: number;
    staffBehavior?: number;
    cleanliness?: number;
    valueForMoney?: number;
    waitTime?: number;
    ambience?: number;
  };
  comment?: string;
  tags?: string[];
  images?: string[];
  isAnonymous: boolean;
  status: 'pending' | 'reviewed' | 'responded' | 'resolved';
  adminResponse?: string;
  respondedAt?: Date;
  isHighlighted: boolean;
  isPublic: boolean;
  helpfulCount: number;
  createdAt: Date;
}

export interface CreateFeedbackDto {
  type: 'appointment' | 'order' | 'general' | 'service' | 'staff';
  referenceId?: string;
  serviceId?: string;
  staffId?: string;
  overallRating: number;
  ratings?: {
    serviceQuality?: number;
    staffBehavior?: number;
    cleanliness?: number;
    valueForMoney?: number;
    waitTime?: number;
    ambience?: number;
  };
  comment?: string;
  tags?: string[];
  images?: string[];
  isAnonymous?: boolean;
}

export interface FeedbackAnalytics {
  overview: {
    totalFeedback: number;
    averageRating: number;
    positiveCount: number;
    negativeCount: number;
  };
  ratingTrend: Array<{ _id: string; avgRating: number; count: number }>;
  byType: Array<{ _id: string; count: number; avgRating: number }>;
  bySentiment: Record<string, number>;
  topIssues: string[];
  topPraises: string[];
}

export interface StaffRatings {
  averageRating: number;
  totalReviews: number;
  distribution: Record<number, number>;
  recentFeedback: Feedback[];
}

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  private readonly apiUrl = `${environment.apiUrl}/feedback`;

  constructor(private http: HttpClient) {}

  // Public
  getPublicFeedback(params?: {
    type?: string;
    minRating?: number;
    limit?: number;
  }): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(`${this.apiUrl}/public`, { params: params as any });
  }

  getTestimonials(limit?: number): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(`${this.apiUrl}/testimonials`, { 
      params: limit ? { limit: limit.toString() } : {} 
    });
  }

  getStaffRatings(staffId: string): Observable<StaffRatings> {
    return this.http.get<StaffRatings>(`${this.apiUrl}/staff/${staffId}/ratings`);
  }

  // Customer
  submitFeedback(dto: CreateFeedbackDto): Observable<Feedback> {
    return this.http.post<Feedback>(this.apiUrl, dto);
  }

  getMyFeedback(): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(`${this.apiUrl}/my-feedback`);
  }

  markHelpful(feedbackId: string): Observable<Feedback> {
    return this.http.post<Feedback>(`${this.apiUrl}/${feedbackId}/helpful`, {});
  }

  // Admin
  getAll(params?: {
    type?: string;
    status?: string;
    minRating?: number;
    maxRating?: number;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Observable<{ feedback: Feedback[]; total: number; pages: number }> {
    return this.http.get<any>(this.apiUrl, { params: params as any });
  }

  getAnalytics(days?: number): Observable<FeedbackAnalytics> {
    return this.http.get<FeedbackAnalytics>(`${this.apiUrl}/analytics`, {
      params: days ? { days: days.toString() } : {}
    });
  }

  getById(id: string): Observable<Feedback> {
    return this.http.get<Feedback>(`${this.apiUrl}/${id}`);
  }

  respond(feedbackId: string, response: string): Observable<Feedback> {
    return this.http.post<Feedback>(`${this.apiUrl}/${feedbackId}/respond`, { response });
  }

  toggleHighlight(feedbackId: string): Observable<Feedback> {
    return this.http.put<Feedback>(`${this.apiUrl}/${feedbackId}/highlight`, {});
  }
}
