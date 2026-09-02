import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, map } from 'rxjs';
import { Service } from '../models/service.model';
import { PARLOUR_SERVICES } from '../data/services.data';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ServiceService {
  constructor(private http: HttpClient) {}

  /**
   * Retrieves all beauty parlour services.
   * If a Google Sheet ID is configured, fetches dynamically; otherwise serves local catalog instantly.
   */
  getAll(): Observable<Service[]> {
    if (environment.googleSheetId && environment.googleSheetId.trim().length > 0) {
      // Dynamic Google Sheet API fetch (public sheet exported as JSON)
      const sheetUrl = `https://opensheet.elk.sh/${environment.googleSheetId}/Services`;
      return this.http.get<any[]>(sheetUrl).pipe(
        map(rows => {
          if (!rows || rows.length === 0) return PARLOUR_SERVICES;
          return rows.map((r, i) => ({
            _id: r._id || r.id || `s_${i + 1}`,
            name: r.name || r.Name,
            price: Number(r.price || r.Price || 0),
            duration: Number(r.duration || r.Duration || 45),
            description: r.description || r.Description || '',
            category: (r.category || r.Category || 'hair').toLowerCase(),
            image: r.image || r.Image || '',
            popular: String(r.popular || r.Popular).toLowerCase() === 'true',
            isActive: r.isActive !== undefined ? String(r.isActive).toLowerCase() === 'true' : true,
            createdAt: new Date()
          } as Service));
        }),
        catchError(() => of(PARLOUR_SERVICES))
      );
    }

    // Default fast local catalog (Zero network delay)
    return of(PARLOUR_SERVICES);
  }

  getById(id: string): Observable<Service | undefined> {
    return this.getAll().pipe(
      map(services => services.find(s => s._id === id))
    );
  }

  getPopular(): Observable<Service[]> {
    return this.getAll().pipe(
      map(services => services.filter(s => s.popular))
    );
  }

  // Fallback stubs for existing code compatibility
  create(service: Partial<Service>): Observable<Service> {
    return of(service as Service);
  }

  update(id: string, service: Partial<Service>): Observable<Service> {
    return of(service as Service);
  }

  delete(id: string): Observable<void> {
    return of(void 0);
  }
}
