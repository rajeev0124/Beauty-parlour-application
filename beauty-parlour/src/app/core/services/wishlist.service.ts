import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface WishlistItem {
  _id: string;
  itemType: 'service' | 'product' | 'package';
  itemId: string;
  item: {
    _id: string;
    name: string;
    price: number;
    image?: string;
    salePrice?: number;
    description?: string;
  };
  addedAt: Date;
  notes?: string;
  priority: 'low' | 'medium' | 'high';
  notifyOnSale: boolean;
}

export interface Wishlist {
  _id: string;
  user: string;
  items: WishlistItem[];
  shareToken?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly apiUrl = `${environment.apiUrl}/wishlist`;
  private wishlistCountSubject = new BehaviorSubject<number>(0);
  wishlistCount$ = this.wishlistCountSubject.asObservable();

  constructor(private http: HttpClient) {
    this.refreshCount();
  }

  getWishlist(): Observable<Wishlist> {
    return this.http.get<Wishlist>(this.apiUrl);
  }

  getCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/count`).pipe(
      tap(res => this.wishlistCountSubject.next(res.count))
    );
  }

  refreshCount(): void {
    this.getCount().subscribe({
      error: () => this.wishlistCountSubject.next(0)
    });
  }

  addItem(itemType: 'service' | 'product' | 'package', itemId: string, options?: { notes?: string; priority?: string; notifyOnSale?: boolean }): Observable<Wishlist> {
    return this.http.post<Wishlist>(`${this.apiUrl}/add`, { itemType, itemId, ...options }).pipe(
      tap(() => this.refreshCount())
    );
  }

  removeItem(itemId: string): Observable<Wishlist> {
    return this.http.delete<Wishlist>(`${this.apiUrl}/remove/${itemId}`).pipe(
      tap(() => this.refreshCount())
    );
  }

  updateItem(itemId: string, updates: { notes?: string; priority?: string; notifyOnSale?: boolean }): Observable<Wishlist> {
    return this.http.put<Wishlist>(`${this.apiUrl}/item`, { itemId, ...updates });
  }

  checkInWishlist(itemId: string): Observable<{ inWishlist: boolean }> {
    return this.http.get<{ inWishlist: boolean }>(`${this.apiUrl}/check/${itemId}`);
  }

  getOnSaleItems(): Observable<WishlistItem[]> {
    return this.http.get<WishlistItem[]>(`${this.apiUrl}/on-sale`);
  }

  getSharedWishlist(shareToken: string): Observable<Wishlist> {
    return this.http.get<Wishlist>(`${this.apiUrl}/shared/${shareToken}`);
  }

  togglePublic(isPublic: boolean): Observable<Wishlist> {
    return this.http.put<Wishlist>(this.apiUrl, { isPublic });
  }

  clearWishlist(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/clear`).pipe(
      tap(() => this.wishlistCountSubject.next(0))
    );
  }

  moveToCart(itemId: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/move-to-cart/${itemId}`, {}).pipe(
      tap(() => this.refreshCount())
    );
  }
}
