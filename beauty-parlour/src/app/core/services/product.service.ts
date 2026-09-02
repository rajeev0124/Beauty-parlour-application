import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, map } from 'rxjs';
import { Product } from '../models/product.model';
import { PARLOUR_PRODUCTS } from '../data/products.data';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private http: HttpClient) {}

  /**
   * Retrieves all beauty parlour products.
   * If a Google Sheet ID is configured, fetches dynamically; otherwise serves local catalog instantly.
   */
  getAll(): Observable<Product[]> {
    if (environment.googleSheetId && environment.googleSheetId.trim().length > 0) {
      // Dynamic Google Sheet API fetch (public sheet exported as JSON)
      const sheetUrl = `https://opensheet.elk.sh/${environment.googleSheetId}/Products`;
      return this.http.get<any[]>(sheetUrl).pipe(
        map(rows => {
          if (!rows || rows.length === 0) return PARLOUR_PRODUCTS;
          return rows.map((r, i) => ({
            _id: r._id || r.id || `p_${i + 1}`,
            name: r.name || r.Name,
            price: Number(r.price || r.Price || 0),
            originalPrice: r.originalPrice || r.OriginalPrice ? Number(r.originalPrice || r.OriginalPrice) : undefined,
            category: (r.category || r.Category || 'hair').toLowerCase(),
            stock: Number(r.stock !== undefined ? r.stock : 20),
            description: r.description || r.Description || '',
            image: r.image || r.Image || '',
            rating: Number(r.rating || r.Rating || 4.5),
            bestseller: String(r.bestseller || r.Bestseller).toLowerCase() === 'true',
            isActive: r.isActive !== undefined ? String(r.isActive).toLowerCase() === 'true' : true,
            createdAt: new Date()
          } as Product));
        }),
        catchError(() => of(PARLOUR_PRODUCTS))
      );
    }

    // Default fast local catalog (Zero network delay)
    return of(PARLOUR_PRODUCTS);
  }

  getById(id: string): Observable<Product | undefined> {
    return this.getAll().pipe(
      map(products => products.find(p => p._id === id))
    );
  }

  // Fallback stubs for existing code compatibility
  create(product: Partial<Product>): Observable<Product> {
    return of(product as Product);
  }

  update(id: string, product: Partial<Product>): Observable<Product> {
    return of(product as Product);
  }

  delete(id: string): Observable<void> {
    return of(void 0);
  }
}
