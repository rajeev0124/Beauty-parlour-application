import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Staff } from '../models/staff.model';

const PARLOUR_STAFF: Staff[] = [
  { _id: 'st1', name: 'Anitha', role: 'Senior Stylist', phone: '9876543001', specialization: 'Hair Stylist & Texture Artist', availability: true, status: 'active', createdAt: new Date() },
  { _id: 'st2', name: 'Kavitha', role: 'Skin Specialist', phone: '9876543002', specialization: 'Skin Care & Gold Facial Expert', availability: true, status: 'active', createdAt: new Date() },
  { _id: 'st3', name: 'Sunitha', role: 'Nail Technician', phone: '9876543003', specialization: 'Nail Art & Gel Specialist', availability: true, status: 'active', createdAt: new Date() },
  { _id: 'st4', name: 'Deepa', role: 'Bridal Expert', phone: '9876543004', specialization: 'Bridal Makeup & Draping Artist', availability: true, status: 'active', createdAt: new Date() },
];

@Injectable({ providedIn: 'root' })
export class StaffService {
  getAll(): Observable<Staff[]> {
    return of(PARLOUR_STAFF);
  }

  getById(id: string): Observable<Staff | undefined> {
    return of(PARLOUR_STAFF.find(s => s._id === id));
  }

  create(staff: Partial<Staff>): Observable<Staff> {
    return of(staff as Staff);
  }

  update(id: string, staff: Partial<Staff>): Observable<Staff> {
    return of(staff as Staff);
  }

  delete(id: string): Observable<void> {
    return of(void 0);
  }
}
