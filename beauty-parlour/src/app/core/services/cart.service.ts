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

  // Exact matching product assets based on product name
  private readonly productNameImageMap: Record<string, string> = {
    'keratin shampoo': '/products/keratin-shampoo.png',
    'argan oil conditioner': '/products/argan-conditioner.png',
    'hair serum – silk shine': '/products/hair-serum.png',
    'hair serum': '/products/hair-serum.png',
    'leave-in hair mask': '/products/hair-mask.png',
    'hair mask': '/products/hair-mask.png',
    'vitamin c face wash': '/products/vit-c-facewash.png',
    'vit c face wash': '/products/vit-c-facewash.png',
    'face wash': '/products/vit-c-facewash.png',
    'hyaluronic moisturizer': '/products/hyaluronic-moisturizer.png',
    'moisturizer': '/products/hyaluronic-moisturizer.png',
    'sunscreen spf 50+': '/products/sunscreen-spf50.png',
    'sunscreen': '/products/sunscreen-spf50.png',
    'night repair cream': '/products/night-repair-cream.png',
    'matte lipstick set': '/products/matte-lipstick-set.png',
    'lipstick': '/products/matte-lipstick-set.png',
    'foundation – natural glow': '/products/foundation-glow.png',
    'foundation': '/products/foundation-glow.png',
    'eye shadow palette': '/products/eyeshadow-palette.png',
    'eyeshadow': '/products/eyeshadow-palette.png',
    'gel nail polish kit': '/products/gel-nail-kit.png',
    'nail polish': '/products/gel-nail-kit.png',
    'nail art stickers': '/products/nail-stickers.png',
    'cuticle oil': '/products/cuticle-oil.png',
    'professional hair dryer': '/products/hair-dryer.png',
    'hair dryer': '/products/hair-dryer.png',
    'straightening iron': '/products/straightening-iron.png',
    'makeup brush set (12 pcs)': '/products/makeup-brushes.png',
    'makeup brush set': '/products/makeup-brushes.png',
    'makeup brush': '/products/makeup-brushes.png'
  };

  private readonly categoryDefaultImages: Record<string, string> = {
    hair: '/products/keratin-shampoo.png',
    skin: '/products/vit-c-facewash.png',
    makeup: '/products/matte-lipstick-set.png',
    nails: '/products/gel-nail-kit.png',
    tools: '/products/hair-dryer.png',
    default: '/products/keratin-shampoo.png'
  };

  /**
   * Resolves the distinct, authentic image for a product based on its name and properties.
   */
  getItemImage(product: Product | any): string {
    if (!product) return '/products/keratin-shampoo.png';

    // 1. Direct valid image path
    if (product.image && typeof product.image === 'string' && product.image.trim().length > 0 && !product.image.includes('photo-1556228720-195a672e8a03')) {
      return product.image;
    }

    // 2. Attached displayImage or first displayImages item
    if (product.displayImage && typeof product.displayImage === 'string' && product.displayImage.trim().length > 0 && !product.displayImage.includes('photo-1556228720-195a672e8a03')) {
      return product.displayImage;
    }
    if (Array.isArray(product.displayImages) && product.displayImages.length > 0) {
      return product.displayImages[0];
    }

    // 3. Exact or partial match by product name
    const cleanName = (product.name || '').toLowerCase().trim();
    if (this.productNameImageMap[cleanName]) {
      return this.productNameImageMap[cleanName];
    }
    for (const [key, img] of Object.entries(this.productNameImageMap)) {
      if (cleanName.includes(key) || key.includes(cleanName)) {
        return img;
      }
    }

    // 4. Fallback by category
    const cat = (product.category || '').toLowerCase().trim();
    if (this.categoryDefaultImages[cat]) {
      return this.categoryDefaultImages[cat];
    }

    return '/products/keratin-shampoo.png';
  }

  private loadInitialCart(): CartItem[] {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
          const items: CartItem[] = JSON.parse(saved);
          return items.map(item => {
            const resolvedImg = this.getItemImage(item.product);
            return {
              ...item,
              product: {
                ...item.product,
                image: resolvedImg,
                ...({ displayImage: resolvedImg } as any)
              }
            };
          });
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
    const resolvedImg = this.getItemImage(product);
    const enrichedProduct: Product = {
      ...product,
      image: resolvedImg,
      ...({ displayImage: resolvedImg } as any)
    };

    const current = [...this.itemsSubject.value];
    const existingIndex = current.findIndex(item => item.product._id === enrichedProduct._id);

    if (existingIndex > -1) {
      current[existingIndex] = {
        ...current[existingIndex],
        product: enrichedProduct,
        quantity: current[existingIndex].quantity + quantity
      };
    } else {
      current.push({ product: enrichedProduct, quantity });
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