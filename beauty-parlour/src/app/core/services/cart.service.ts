import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Product } from '../models/product.model';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly STORAGE_KEY = 'tinore_cart_items';
  private itemsSubject = new BehaviorSubject<CartItem[]>(this.loadInitialCart());
  private drawerOpenSubject = new BehaviorSubject<boolean>(false);

  items$ = this.itemsSubject.asObservable();
  drawerOpen$ = this.drawerOpenSubject.asObservable();

  totalItems$: Observable<number> = this.items$.pipe(
    map(items => items.reduce((sum, item) => sum + item.quantity, 0))
  );

  subtotal$: Observable<number> = this.items$.pipe(
    map(items => items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0))
  );

  freeShippingThreshold = 999;

  freeShippingProgress$: Observable<{ percentage: number; remaining: number; eligible: boolean }> = this.subtotal$.pipe(
    map(subtotal => {
      const remaining = Math.max(0, this.freeShippingThreshold - subtotal);
      const percentage = Math.min(100, Math.round((subtotal / this.freeShippingThreshold) * 100));
      return {
        percentage,
        remaining,
        eligible: subtotal >= this.freeShippingThreshold
      };
    })
  );

  private loadInitialCart(): CartItem[] {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
          return JSON.parse(saved);
        }
      } catch (e) {
        console.warn('Failed to load cart from localStorage', e);
      }
    }
    return [];
  }

  private saveCart(items: CartItem[]): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.warn('Failed to save cart to localStorage', e);
      }
    }
  }

  openDrawer(): void {
    this.drawerOpenSubject.next(true);
  }

  closeDrawer(): void {
    this.drawerOpenSubject.next(false);
  }

  toggleDrawer(): void {
    this.drawerOpenSubject.next(!this.drawerOpenSubject.value);
  }

  addItem(product: Product, quantity = 1): void {
    const current = [...this.itemsSubject.value];
    const existingIndex = current.findIndex(item => item.product._id === product._id);

    if (existingIndex > -1) {
      current[existingIndex] = {
        ...current[existingIndex],
        quantity: current[existingIndex].quantity + quantity
      };
    } else {
      current.push({ product, quantity });
    }

    this.itemsSubject.next(current);
    this.saveCart(current);
    this.openDrawer();
  }

  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }

    const current = this.itemsSubject.value.map(item => {
      if (item.product._id === productId) {
        return { ...item, quantity };
      }
      return item;
    });

    this.itemsSubject.next(current);
    this.saveCart(current);
  }

  removeItem(productId: string): void {
    const current = this.itemsSubject.value.filter(item => item.product._id !== productId);
    this.itemsSubject.next(current);
    this.saveCart(current);
  }

  clearCart(): void {
    this.itemsSubject.next([]);
    this.saveCart([]);
  }
}