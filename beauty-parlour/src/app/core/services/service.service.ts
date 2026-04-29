import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { Service } from '../models/service.model';
import { environment } from '../../../environments/environment';

const DEMO_SERVICES: Service[] = [
  { _id: 's1', name: 'Hair Cut – Women', category: 'hair', duration: 45, price: 500, description: 'Professional haircut with styling and blow dry', popular: true, isActive: true, createdAt: new Date() },
  { _id: 's2', name: 'Hair Cut – Men', category: 'hair', duration: 30, price: 300, description: 'Trendy cuts and classic styles for men', isActive: true, createdAt: new Date() },
  { _id: 's3', name: 'Hair Coloring', category: 'hair', duration: 90, price: 2500, description: 'Full color, highlights, balayage, ombre', popular: true, isActive: true, createdAt: new Date() },
  { _id: 's4', name: 'Hair Spa', category: 'hair', duration: 60, price: 1200, description: 'Deep conditioning treatment for healthy hair', isActive: true, createdAt: new Date() },
  { _id: 's5', name: 'Keratin Treatment', category: 'hair', duration: 120, price: 5000, description: 'Smoothing and frizz-free keratin straightening', isActive: true, createdAt: new Date() },
  { _id: 's6', name: 'Classic Facial', category: 'skin', duration: 45, price: 800, description: 'Deep cleansing, exfoliation and hydration', popular: true, isActive: true, createdAt: new Date() },
  { _id: 's7', name: 'Gold Facial', category: 'skin', duration: 60, price: 1500, description: 'Luxury gold-infused anti-aging treatment', isActive: true, createdAt: new Date() },
  { _id: 's8', name: 'Cleanup', category: 'skin', duration: 30, price: 500, description: 'Quick skin refresh with cleansing and toning', isActive: true, createdAt: new Date() },
  { _id: 's9', name: 'Chemical Peel', category: 'skin', duration: 45, price: 2000, description: 'Exfoliation treatment for brighter skin', isActive: true, createdAt: new Date() },
  { _id: 's10', name: 'Manicure', category: 'nails', duration: 30, price: 400, description: 'Classic manicure with nail shaping and polish', isActive: true, createdAt: new Date() },
  { _id: 's11', name: 'Pedicure', category: 'nails', duration: 45, price: 500, description: 'Relaxing foot spa with nail care and polish', isActive: true, createdAt: new Date() },
  { _id: 's12', name: 'Gel Nails', category: 'nails', duration: 60, price: 1200, description: 'Long-lasting gel polish with nail art options', isActive: true, createdAt: new Date() },
  { _id: 's13', name: 'Nail Extensions', category: 'nails', duration: 90, price: 2500, description: 'Acrylic or gel extensions with custom art', isActive: true, createdAt: new Date() },
  { _id: 's14', name: 'Full Body Massage', category: 'massage', duration: 60, price: 1500, description: 'Relaxing Swedish or deep tissue massage', popular: true, isActive: true, createdAt: new Date() },
  { _id: 's15', name: 'Head Massage', category: 'massage', duration: 30, price: 500, description: 'Stress-relieving head and shoulder massage', isActive: true, createdAt: new Date() },
  { _id: 's16', name: 'Aromatherapy', category: 'massage', duration: 75, price: 2000, description: 'Essential oil-infused therapeutic massage', isActive: true, createdAt: new Date() },
  { _id: 's17', name: 'Bridal Makeup', category: 'bridal', duration: 120, price: 15000, description: 'HD makeup with trial session included', popular: true, isActive: true, createdAt: new Date() },
  { _id: 's18', name: 'Pre-Bridal Package', category: 'bridal', duration: 180, price: 8000, description: 'Facial, cleanup, waxing, mani-pedi combo', isActive: true, createdAt: new Date() },
  { _id: 's19', name: 'Party Makeup', category: 'bridal', duration: 60, price: 3000, description: 'Glam makeup for special occasions', isActive: true, createdAt: new Date() },
];

@Injectable({ providedIn: 'root' })
export class ServiceService {
  private readonly apiUrl = `${environment.apiUrl}/services`;
  private readonly demoMode = false; // Connected to backend

  constructor(private http: HttpClient) {}

  getAll(): Observable<Service[]> {
    if (this.demoMode) {
      return of(DEMO_SERVICES).pipe(delay(300));
    }
    return this.http.get<Service[]>(this.apiUrl);
  }

  getById(id: string): Observable<Service> {
    if (this.demoMode) {
      const service = DEMO_SERVICES.find(s => s._id === id);
      return of(service!).pipe(delay(200));
    }
    return this.http.get<Service>(`${this.apiUrl}/${id}`);
  }

  create(service: Partial<Service>): Observable<Service> {
    return this.http.post<Service>(this.apiUrl, service);
  }

  update(id: string, service: Partial<Service>): Observable<Service> {
    return this.http.put<Service>(`${this.apiUrl}/${id}`, service);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getPopular(): Observable<Service[]> {
    if (this.demoMode) {
      return of(DEMO_SERVICES.filter(s => s.popular)).pipe(delay(300));
    }
    return this.http.get<Service[]>(`${this.apiUrl}/popular`);
  }
}
