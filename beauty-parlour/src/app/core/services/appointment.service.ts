import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, map } from 'rxjs';
import { Appointment } from '../models/appointment.model';
import { environment } from '../../../environments/environment';

const DEMO_APPOINTMENTS: Appointment[] = [
  { _id: 'a1', userId: 'demo-cust-001', userName: 'Priya Sharma', serviceId: 's1', serviceName: 'Hair Cut – Women', staffId: 'st1', staffName: 'Anitha', date: new Date(Date.now() + 86400000 * 2).toISOString(), time: '10:00 AM', status: 'confirmed', createdAt: new Date() },
  { _id: 'a2', userId: 'demo-cust-001', userName: 'Priya Sharma', serviceId: 's6', serviceName: 'Classic Facial', staffId: 'st2', staffName: 'Kavitha', date: new Date(Date.now() + 86400000 * 5).toISOString(), time: '2:30 PM', status: 'pending', createdAt: new Date() },
  { _id: 'a3', userId: 'demo-cust-002', userName: 'Sita Reddy', serviceId: 's10', serviceName: 'Manicure', staffId: 'st3', staffName: 'Sunitha', date: new Date(Date.now() - 86400000 * 3).toISOString(), time: '11:00 AM', status: 'completed', createdAt: new Date() },
  { _id: 'a4', userId: 'demo-cust-003', userName: 'Lakshmi Devi', serviceId: 's3', serviceName: 'Hair Coloring', staffId: 'st1', staffName: 'Anitha', date: new Date(Date.now() - 86400000 * 10).toISOString(), time: '3:00 PM', status: 'completed', createdAt: new Date() },
  { _id: 'a5', userId: 'demo-cust-004', userName: 'Rani Kumari', serviceId: 's3', serviceName: 'Hair Color', staffId: 'st1', staffName: 'Anitha', date: new Date().toISOString(), time: '3:30 PM', status: 'cancelled', createdAt: new Date() },
  { _id: 'a6', userId: 'demo-cust-005', userName: 'Meera Nair', serviceId: 's11', serviceName: 'Pedicure', staffId: 'st2', staffName: 'Kavitha', date: new Date().toISOString(), time: '4:00 PM', status: 'confirmed', createdAt: new Date() },
  { _id: 'a7', userId: 'demo-cust-001', userName: 'Priya Sharma', serviceId: 's14', serviceName: 'Full Body Massage', staffId: 'st4', staffName: 'Deepa', date: new Date(Date.now() - 86400000 * 7).toISOString(), time: '4:00 PM', status: 'cancelled', createdAt: new Date() },
];

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private readonly apiUrl = `${environment.apiUrl}/appointments`;
  private readonly demoMode = false; // Connected to backend
  private demoData = [...DEMO_APPOINTMENTS];

  constructor(private http: HttpClient) {}

  getAll(): Observable<Appointment[]> {
    if (this.demoMode) {
      return of(this.demoData).pipe(delay(300));
    }
    return this.http.get<Appointment[]>(this.apiUrl);
  }

  getById(id: string): Observable<Appointment> {
    if (this.demoMode) {
      const appt = this.demoData.find(a => a._id === id);
      return of(appt!).pipe(delay(200));
    }
    return this.http.get<Appointment>(`${this.apiUrl}/${id}`);
  }

  create(appointment: Partial<Appointment>): Observable<Appointment> {
    if (this.demoMode) {
      const newAppt: Appointment = {
        _id: 'a' + Date.now(),
        userId: appointment.userId || '',
        userName: appointment.userName,
        serviceId: appointment.serviceId || '',
        serviceName: appointment.serviceName,
        staffId: appointment.staffId || '',
        staffName: appointment.staffName,
        date: appointment.date || new Date().toISOString(),
        time: appointment.time || '',
        status: 'pending',
        notes: appointment.notes,
        createdAt: new Date()
      };
      this.demoData.unshift(newAppt);
      return of(newAppt).pipe(delay(400));
    }
    return this.http.post<Appointment>(this.apiUrl, appointment);
  }

  update(id: string, appointment: Partial<Appointment>): Observable<Appointment> {
    if (this.demoMode) {
      const idx = this.demoData.findIndex(a => a._id === id);
      if (idx > -1) {
        this.demoData[idx] = { ...this.demoData[idx], ...appointment };
      }
      return of(this.demoData[idx]).pipe(delay(300));
    }
    return this.http.put<Appointment>(`${this.apiUrl}/${id}`, appointment);
  }

  delete(id: string): Observable<void> {
    if (this.demoMode) {
      this.demoData = this.demoData.filter(a => a._id !== id);
      return of(void 0).pipe(delay(300));
    }
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getByUser(userId: string): Observable<Appointment[]> {
    if (this.demoMode) {
      return of(this.demoData.filter(a => a.userId === userId)).pipe(delay(300));
    }
    return this.http.get<Appointment[]>(`${this.apiUrl}/user/${userId}`);
  }

  getByStaff(staffId: string): Observable<Appointment[]> {
    if (this.demoMode) {
      return of(this.demoData.filter(a => a.staffId === staffId)).pipe(delay(300));
    }
    return this.http.get<Appointment[]>(`${this.apiUrl}/staff/${staffId}`);
  }

  updateStatus(id: string, status: string): Observable<Appointment> {
    if (this.demoMode) {
      const idx = this.demoData.findIndex(a => a._id === id);
      if (idx > -1) {
        this.demoData[idx] = { ...this.demoData[idx], status: status as Appointment['status'] };
      }
      return of(this.demoData[idx]).pipe(delay(300));
    }
    return this.http.put<Appointment>(`${this.apiUrl}/status/${id}`, { status });
  }
}
