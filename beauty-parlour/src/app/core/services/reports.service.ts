import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardStats {
  totalCustomers: number;
  totalAppointments: number;
  totalOrders: number;
  totalRevenue: number;
  appointmentsByStatus: { _id: string; count: number }[];
  revenueByMonth: { _id: string; revenue: number }[];
  topServices: { _id: string; name: string; count: number }[];
  topProducts: { _id: string; name: string; count: number }[];
  recentAppointments?: any[];
}

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private readonly apiUrl = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) {}

  getDashboardStats(startDate?: string, endDate?: string): Observable<DashboardStats> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    
    return this.http.get<DashboardStats>(`${this.apiUrl}/dashboard`, { params });
  }

  getAppointmentReport(startDate: string, endDate: string): Observable<any[]> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<any[]>(`${this.apiUrl}/appointments`, { params });
  }

  getSalesReport(startDate: string, endDate: string): Observable<any> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<any>(`${this.apiUrl}/sales`, { params });
  }

  getCustomerReport(startDate?: string, endDate?: string): Observable<any[]> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<any[]>(`${this.apiUrl}/customers`, { params });
  }
}
