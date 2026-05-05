import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Schedule {
  _id: string;
  staff: { _id: string; name: string; profileImage?: string; role?: string };
  date: Date;
  startTime: string; // HH:mm format
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
  breaks?: { breakStart: string; breakEnd: string; breakType?: string }[];
  isAvailable?: boolean; // Computed: !isLeave && status !== 'leave'
  isLeave: boolean;
  leaveReason?: string;
  leaveType?: string;
  status?: string;
  bookedSlots?: { time: string; appointmentId: string }[];
  createdAt?: Date;
}

export interface ScheduleStats {
  totalStaff: number;
  availableToday: number;
  onLeaveToday: number;
  upcomingLeaves: { staff: string; date: Date; reason: string }[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  staffId: string;
  type: 'working' | 'leave' | 'break';
  color?: string;
}

@Injectable({ providedIn: 'root' })
export class ScheduleService {
  private readonly apiUrl = `${environment.apiUrl}/schedule`;

  constructor(private http: HttpClient) {}

  getAll(filters?: { startDate?: string; endDate?: string; staffId?: string }): Observable<Schedule[]> {
    let params = new HttpParams();
    if (filters?.startDate) params = params.set('startDate', filters.startDate);
    if (filters?.endDate) params = params.set('endDate', filters.endDate);
    if (filters?.staffId) params = params.set('staffId', filters.staffId);
    return this.http.get<Schedule[]>(this.apiUrl, { params });
  }

  getToday(): Observable<Schedule[]> {
    return this.http.get<Schedule[]>(`${this.apiUrl}/today`);
  }

  getByStaff(staffId: string, startDate?: string, endDate?: string): Observable<Schedule[]> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<Schedule[]>(`${this.apiUrl}/staff/${staffId}`, { params });
  }

  getRange(startDate: string, endDate: string): Observable<Schedule[]> {
    return this.http.get<Schedule[]>(`${this.apiUrl}/range`, { params: { startDate, endDate } });
  }

  getCalendar(month: number, year: number): Observable<CalendarEvent[]> {
    return this.http.get<CalendarEvent[]>(`${this.apiUrl}/calendar`, { params: { month: month.toString(), year: year.toString() } });
  }

  getStats(): Observable<ScheduleStats> {
    return this.http.get<ScheduleStats>(`${this.apiUrl}/stats`);
  }

  create(schedule: Partial<Schedule>): Observable<Schedule> {
    return this.http.post<Schedule>(this.apiUrl, schedule);
  }

  createBulk(schedules: Partial<Schedule>[]): Observable<Schedule[]> {
    return this.http.post<Schedule[]>(`${this.apiUrl}/bulk`, { schedules });
  }

  createLeave(staffId: string, date: string, leaveType: string, reason?: string): Observable<Schedule> {
    return this.http.post<Schedule>(`${this.apiUrl}/leave`, { 
      staff: staffId, 
      startDate: date, 
      endDate: date,
      leaveType,
      reason
    });
  }

  update(id: string, schedule: Partial<Schedule>): Observable<Schedule> {
    return this.http.put<Schedule>(`${this.apiUrl}/${id}`, schedule);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
