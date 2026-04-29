import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface InventoryItem {
  _id: string;
  product: { _id: string; name: string; image?: string; sku?: string };
  quantity: number;
  minStock: number;
  maxStock?: number;
  reorderPoint: number;
  lastRestocked?: Date;
  location?: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
  updatedAt: Date;
}

export interface StockMovement {
  _id: string;
  product: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  reference?: string;
  performedBy: string;
  createdAt: Date;
}

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly apiUrl = `${environment.apiUrl}/inventory`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>(this.apiUrl);
  }

  getByProduct(productId: string): Observable<InventoryItem> {
    return this.http.get<InventoryItem>(`${this.apiUrl}/product/${productId}`);
  }

  updateStock(productId: string, data: { quantity: number; type: 'in' | 'out' | 'adjustment'; reason: string }): Observable<InventoryItem> {
    return this.http.put<InventoryItem>(`${this.apiUrl}/update/${productId}`, data);
  }

  addStock(productId: string, quantity: number, reason?: string): Observable<InventoryItem> {
    return this.http.post<InventoryItem>(`${this.apiUrl}/add-stock`, { productId, quantity, reason });
  }

  getLowStock(): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>(`${this.apiUrl}?status=low-stock`);
  }

  getOutOfStock(): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>(`${this.apiUrl}?status=out-of-stock`);
  }
}
