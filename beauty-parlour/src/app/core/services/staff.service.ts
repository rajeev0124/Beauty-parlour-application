import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { Staff } from '../models/staff.model';
import { environment } from '../../../environments/environment';

const DEMO_STAFF: Staff[] = [
  { _id: 'st1', name: 'Anitha', role: 'Senior Stylist', phone: '9876543001', specialization: 'Hair Stylist', availability: true, status: 'active', createdAt: new Date() },
  { _id: 'st2', name: 'Kavitha', role: 'Skin Specialist', phone: '9876543002', specialization: 'Skin Care Expert', availability: true, status: 'active', createdAt: new Date() },
  { _id: 'st3', name: 'Sunitha', role: 'Nail Technician', phone: '9876543003', specialization: 'Nail Artist', availability: true, status: 'active', createdAt: new Date() },
  { _id: 'st4', name: 'Deepa', role: 'Bridal Expert', phone: '9876543004', specialization: 'Bridal Specialist', availability: true, status: 'active', createdAt: new Date() },
];

@Injectable({ providedIn: 'root' })
export class StaffService {
  private readonly apiUrl = `${environment.apiUrl}/staff`;
  private readonly demoMode = false; // Connected to backend

  constructor(private http: HttpClient) {}

  getAll(): Observable<Staff[]> {
    if (this.demoMode) {
      return of(DEMO_STAFF).pipe(delay(300));
    }
    return this.http.get<Staff[]>(this.apiUrl);
  }

  getById(id: string): Observable<Staff> {
    if (this.demoMode) {
      const staff = DEMO_STAFF.find(s => s._id === id);
      return of(staff!).pipe(delay(200));
    }
    return this.http.get<Staff>(`${this.apiUrl}/${id}`);
  }

  create(staff: Partial<Staff>): Observable<Staff> {
    return this.http.post<Staff>(this.apiUrl, staff);
  }

  update(id: string, staff: Partial<Staff>): Observable<Staff> {
    return this.http.put<Staff>(`${this.apiUrl}/${id}`, staff);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
