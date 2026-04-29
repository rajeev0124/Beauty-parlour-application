import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Expense {
  _id: string;
  title: string;
  description?: string;
  amount: number;
  category: 'rent' | 'utilities' | 'salaries' | 'supplies' | 'marketing' | 'maintenance' | 'other';
  date: Date;
  paymentMethod: 'cash' | 'card' | 'bank-transfer' | 'upi';
  receipt?: string;
  vendor?: string;
  isRecurring: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  status: 'pending' | 'paid' | 'cancelled';
  createdBy: { _id: string; name: string };
  createdAt: Date;
}

export interface ExpenseStats {
  totalExpenses: number;
  totalAmount: number;
  byCategory: { category: string; amount: number; count: number }[];
  byMonth: { month: string; amount: number }[];
  pendingAmount: number;
}

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private readonly apiUrl = `${environment.apiUrl}/expenses`;

  constructor(private http: HttpClient) {}

  getAll(filters?: { startDate?: string; endDate?: string; category?: string; status?: string }): Observable<Expense[]> {
    let params = new HttpParams();
    if (filters?.startDate) params = params.set('startDate', filters.startDate);
    if (filters?.endDate) params = params.set('endDate', filters.endDate);
    if (filters?.category) params = params.set('category', filters.category);
    if (filters?.status) params = params.set('status', filters.status);
    return this.http.get<Expense[]>(this.apiUrl, { params });
  }

  getById(id: string): Observable<Expense> {
    return this.http.get<Expense>(`${this.apiUrl}/${id}`);
  }

  getStats(startDate?: string, endDate?: string): Observable<ExpenseStats> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<ExpenseStats>(`${this.apiUrl}/stats`, { params });
  }

  getRecurring(): Observable<Expense[]> {
    return this.http.get<Expense[]>(`${this.apiUrl}/recurring`);
  }

  create(expense: Partial<Expense>): Observable<Expense> {
    return this.http.post<Expense>(this.apiUrl, expense);
  }

  update(id: string, expense: Partial<Expense>): Observable<Expense> {
    return this.http.put<Expense>(`${this.apiUrl}/${id}`, expense);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
