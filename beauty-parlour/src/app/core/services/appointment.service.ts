import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Appointment } from '../models/appointment.model';

const DEMO_APPOINTMENTS: Appointment[] = [
  { _id: 'a1', userId: 'demo-cust-001', userName: 'Priya Sharma', serviceId: 's1', serviceName: 'Hair Cut – Women', staffId: 'st1', staffName: 'Anitha', date: new Date(Date.now() + 86400000 * 2).toISOString(), time: '10:00 AM', status: 'confirmed', createdAt: new Date() },
  { _id: 'a2', userId: 'demo-cust-001', userName: 'Priya Sharma', serviceId: 's6', serviceName: 'Classic Facial', staffId: 'st2', staffName: 'Kavitha', date: new Date(Date.now() + 86400000 * 5).toISOString(), time: '2:30 PM', status: 'pending', createdAt: new Date() },
];

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private demoData = [...DEMO_APPOINTMENTS];

  getAll(): Observable<Appointment[]> {
    return of(this.demoData);
  }

  getById(id: string): Observable<Appointment | undefined> {
    return of(this.demoData.find(a => a._id === id));
  }

  create(appointment: Partial<Appointment>): Observable<Appointment> {
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
    return of(newAppt);
  }

  update(id: string, appointment: Partial<Appointment>): Observable<Appointment> {
    const idx = this.demoData.findIndex(a => a._id === id);
    if (idx > -1) {
      this.demoData[idx] = { ...this.demoData[idx], ...appointment };
    }
    return of(this.demoData[idx]);
  }

  delete(id: string): Observable<void> {
    this.demoData = this.demoData.filter(a => a._id !== id);
    return of(void 0);
  }

  getByUser(userId: string): Observable<Appointment[]> {
    return of(this.demoData.filter(a => a.userId === userId));
  }

  getByStaff(staffId: string): Observable<Appointment[]> {
    return of(this.demoData.filter(a => a.staffId === staffId));
  }

  updateStatus(id: string, status: string): Observable<Appointment> {
    const idx = this.demoData.findIndex(a => a._id === id);
    if (idx > -1) {
      this.demoData[idx] = { ...this.demoData[idx], status: status as Appointment['status'] };
    }
    return of(this.demoData[idx]);
  }
}
