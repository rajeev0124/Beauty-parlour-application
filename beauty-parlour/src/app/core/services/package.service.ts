import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Package {
  _id: string;
  name: string;
  description: string;
  category: string;
  services: { service?: { _id: string; name: string; price: number; duration: number }; quantity: number }[];
  products?: { product?: { _id: string; name: string; price: number }; quantity: number }[];
  originalPrice: number;
  packagePrice: number; // This is what backend expects
  discountedPrice?: number; // For display (computed)
  discountPercentage: number;
  validityDays: number;
  maxRedemptions?: number;
  terms?: string[];
  image?: string;
  imageUrl?: string;
  isActive: boolean;
  isFeatured?: boolean;
  popularity?: number;
  createdAt?: Date;
}

export interface PackageStats {
  totalPackages: number;
  activePackages: number;
  totalSold: number;
  revenue: number;
  popularPackages: Package[];
}

@Injectable({ providedIn: 'root' })
export class PackageService {
  private readonly apiUrl = `${environment.apiUrl}/packages`;

  constructor(private http: HttpClient) {}

  getAll(filters?: { category?: string; isActive?: boolean }): Observable<Package[]> {
    let params = new HttpParams();
    if (filters?.category) params = params.set('category', filters.category);
    if (filters?.isActive !== undefined) params = params.set('isActive', filters.isActive.toString());
    return this.http.get<Package[]>(this.apiUrl, { params });
  }

  getActive(): Observable<Package[]> {
    return this.http.get<Package[]>(`${this.apiUrl}/active`);
  }

  getPopular(limit: number = 5): Observable<Package[]> {
    return this.http.get<Package[]>(`${this.apiUrl}/popular`, { params: { limit: limit.toString() } });
  }

  getByCategory(category: string): Observable<Package[]> {
    return this.http.get<Package[]>(`${this.apiUrl}/category/${category}`);
  }

  getById(id: string): Observable<Package> {
    return this.http.get<Package>(`${this.apiUrl}/${id}`);
  }

  getAvailability(id: string): Observable<{ available: boolean; remainingUses: number }> {
    return this.http.get<{ available: boolean; remainingUses: number }>(`${this.apiUrl}/${id}/availability`);
  }

  getStats(): Observable<PackageStats> {
    return this.http.get<PackageStats>(`${this.apiUrl}/stats`);
  }

  create(pkg: Partial<Package>): Observable<Package> {
    return this.http.post<Package>(this.apiUrl, pkg);
  }

  update(id: string, pkg: Partial<Package>): Observable<Package> {
    return this.http.put<Package>(`${this.apiUrl}/${id}`, pkg);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  toggleActive(id: string): Observable<Package> {
    return this.http.patch<Package>(`${this.apiUrl}/${id}/toggle-active`, {});
  }
}
