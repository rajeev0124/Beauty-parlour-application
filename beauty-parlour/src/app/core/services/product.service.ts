import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { Product } from '../models/product.model';
import { environment } from '../../../environments/environment';

const DEMO_PRODUCTS: Product[] = [
  { _id: 'p1', name: 'Keratin Shampoo', category: 'hair', price: 650, originalPrice: 800, image: '/products/keratin-shampoo.png', rating: 4.5, bestseller: true, stock: 25, isActive: true, createdAt: new Date() },
  { _id: 'p2', name: 'Argan Oil Conditioner', category: 'hair', price: 550, image: '/products/argan-conditioner.png', rating: 4.3, stock: 18, isActive: true, createdAt: new Date() },
  { _id: 'p3', name: 'Hair Serum – Silk Shine', category: 'hair', price: 480, image: '/products/hair-serum.png', rating: 4.7, bestseller: true, stock: 30, isActive: true, createdAt: new Date() },
  { _id: 'p4', name: 'Leave-In Hair Mask', category: 'hair', price: 720, image: '/products/hair-mask.png', rating: 4.2, stock: 12, isActive: true, createdAt: new Date() },
  { _id: 'p5', name: 'Vitamin C Face Wash', category: 'skin', price: 350, image: '/products/vit-c-facewash.png', rating: 4.6, bestseller: true, stock: 40, isActive: true, createdAt: new Date() },
  { _id: 'p6', name: 'Hyaluronic Moisturizer', category: 'skin', price: 890, originalPrice: 1100, image: '/products/hyaluronic-moisturizer.png', rating: 4.8, stock: 15, isActive: true, createdAt: new Date() },
  { _id: 'p7', name: 'Sunscreen SPF 50+', category: 'skin', price: 420, image: '/products/sunscreen-spf50.png', rating: 4.4, stock: 35, isActive: true, createdAt: new Date() },
  { _id: 'p8', name: 'Night Repair Cream', category: 'skin', price: 1250, image: '/products/night-repair-cream.png', rating: 4.5, stock: 10, isActive: true, createdAt: new Date() },
  { _id: 'p9', name: 'Matte Lipstick Set', category: 'makeup', price: 1200, image: '/products/matte-lipstick-set.png', rating: 4.6, stock: 20, isActive: true, createdAt: new Date() },
  { _id: 'p10', name: 'Foundation – Natural Glow', category: 'makeup', price: 980, image: '/products/foundation-glow.png', rating: 4.3, bestseller: true, stock: 22, isActive: true, createdAt: new Date() },
  { _id: 'p11', name: 'Eye Shadow Palette', category: 'makeup', price: 1500, originalPrice: 1800, image: '/products/eyeshadow-palette.png', rating: 4.7, stock: 14, isActive: true, createdAt: new Date() },
  { _id: 'p12', name: 'Gel Nail Polish Kit', category: 'nails', price: 850, image: '/products/gel-nail-kit.png', rating: 4.4, stock: 28, isActive: true, createdAt: new Date() },
  { _id: 'p13', name: 'Nail Art Stickers', category: 'nails', price: 250, image: '/products/nail-stickers.png', rating: 4.1, stock: 50, isActive: true, createdAt: new Date() },
  { _id: 'p14', name: 'Cuticle Oil', category: 'nails', price: 320, image: '/products/cuticle-oil.png', rating: 4.3, stock: 38, isActive: true, createdAt: new Date() },
  { _id: 'p15', name: 'Professional Hair Dryer', category: 'tools', price: 2800, originalPrice: 3500, image: '/products/hair-dryer.png', rating: 4.8, bestseller: true, stock: 8, isActive: true, createdAt: new Date() },
  { _id: 'p16', name: 'Straightening Iron', category: 'tools', price: 2200, image: '/products/straightening-iron.png', rating: 4.5, stock: 10, isActive: true, createdAt: new Date() },
  { _id: 'p17', name: 'Makeup Brush Set (12 pcs)', category: 'tools', price: 1100, image: '/products/makeup-brushes.png', rating: 4.6, stock: 16, isActive: true, createdAt: new Date() },
];

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly apiUrl = `${environment.apiUrl}/products`;
  private readonly demoMode = false; // Connected to backend

  constructor(private http: HttpClient) {}

  getAll(): Observable<Product[]> {
    if (this.demoMode) {
      return of(DEMO_PRODUCTS).pipe(delay(300));
    }
    return this.http.get<Product[]>(this.apiUrl);
  }

  getById(id: string): Observable<Product> {
    if (this.demoMode) {
      const product = DEMO_PRODUCTS.find(p => p._id === id);
      return of(product!).pipe(delay(200));
    }
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  create(product: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  update(id: string, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
