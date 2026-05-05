import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductService } from '../../../core/services/product.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-user-products',
  standalone: true,
  imports: [DecimalPipe, MatIconModule, MatButtonModule, MatSnackBarModule],
  templateUrl: './user-products.component.html',
  styleUrl: './user-products.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserProductsComponent implements OnInit {
  activeCategory = 'all';
  loading = true;
  errorMessage = '';
  viewMode: 'grid' | 'list' = 'grid';
  Math = Math; // Expose Math to template

  categories = [
    { key: 'all', label: 'All Products', icon: 'apps', count: 0 },
    { key: 'hair', label: 'Hair Care', icon: 'content_cut', count: 0 },
    { key: 'skin', label: 'Skin Care', icon: 'face_retouching_natural', count: 0 },
    { key: 'makeup', label: 'Makeup', icon: 'brush', count: 0 },
    { key: 'nails', label: 'Nail Care', icon: 'spa', count: 0 },
    { key: 'tools', label: 'Tools', icon: 'construction', count: 0 },
  ];

  products: Product[] = [];

  // Product icon mapping by category
  private productIcons: Record<string, string> = {
    hair: 'content_cut',
    skin: 'face_retouching_natural',
    makeup: 'brush',
    nails: 'spa',
    tools: 'construction',
    default: 'inventory_2'
  };

  // Professional product images by category (Unsplash)
  private productImages: Record<string, string[]> = {
    hair: [
      'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=400&q=80',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80',
      'https://images.unsplash.com/photo-1626015365107-aa4f5d89fd6a?w=400&q=80',
      'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&q=80',
      'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&q=80'
    ],
    skin: [
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80',
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&q=80',
      'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400&q=80',
      'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&q=80',
      'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&q=80'
    ],
    makeup: [
      'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&q=80',
      'https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=400&q=80',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80',
      'https://images.unsplash.com/photo-1503236823255-94609f598e71?w=400&q=80',
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&q=80'
    ],
    nails: [
      'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&q=80',
      'https://images.unsplash.com/photo-1610992015732-2449b0dd2b3f?w=400&q=80',
      'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=400&q=80',
      'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=400&q=80'
    ],
    tools: [
      'https://images.unsplash.com/photo-1522338140262-f46f5913618a?w=400&q=80',
      'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=400&q=80',
      'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400&q=80',
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80'
    ],
    default: [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80',
      'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400&q=80',
      'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&q=80'
    ]
  };

  // Category colors for fallback icons
  categoryColors: Record<string, string> = {
    hair: '#F59E0B',
    skin: '#10B981',
    makeup: '#EC4899',
    nails: '#8B5CF6',
    tools: '#6366F1',
    default: '#7C3AED'
  };

  // Track image load failures
  imageErrors: Set<string> = new Set();

  constructor(
    private snackBar: MatSnackBar,
    private productService: ProductService,
    private wishlistService: WishlistService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.errorMessage = '';
    this.productService.getAll().subscribe({
      next: (products) => {
        // Assign consistent images based on product ID
        this.products = products.map((p, index) => ({ 
          ...p, 
          inWishlist: false,
          displayImage: this.getConsistentImage(p._id, p.category, index)
        }));
        this.updateCategoryCounts();
        this.loading = false;
        this.cdr.markForCheck();
        
        // Check which products are in wishlist
        this.loadWishlistStatus();
      },
      error: () => {
        this.errorMessage = 'Failed to load products. Please try again later.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  // Generate consistent image based on product ID hash
  private getConsistentImage(productId: string, category: string, fallbackIndex: number): string {
    const images = this.productImages[category?.toLowerCase()] || this.productImages['default'];
    // Use simple hash of product ID to get consistent index
    let hash = 0;
    for (let i = 0; i < (productId || '').length; i++) {
      hash = ((hash << 5) - hash) + productId.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    const index = Math.abs(hash || fallbackIndex) % images.length;
    return images[index];
  }

  private loadWishlistStatus(): void {
    this.wishlistService.getWishlist().subscribe({
      next: (wishlist: any) => {
        const items = Array.isArray(wishlist) ? wishlist : (wishlist?.items || []);
        const wishlistIds = new Set(items.map((item: any) => item.itemId || item.item?._id));
        
        this.products.forEach(product => {
          (product as any).inWishlist = wishlistIds.has(product._id);
        });
        this.cdr.markForCheck();
      },
      error: () => {
        // User not logged in or no wishlist - ignore
      }
    });
  }

  private updateCategoryCounts(): void {
    this.categories.forEach(cat => {
      if (cat.key === 'all') {
        cat.count = this.products.length;
      } else {
        cat.count = this.products.filter(p => p.category === cat.key).length;
      }
    });
  }

  get filteredProducts(): Product[] {
    if (this.activeCategory === 'all') return this.products;
    return this.products.filter(p => p.category === this.activeCategory);
  }

  setCategory(key: string): void {
    this.activeCategory = key;
  }

  getCategoryLabel(key: string): string {
    const cat = this.categories.find(c => c.key === key);
    return cat ? cat.label : key;
  }

  getProductIcon(category: string): string {
    return this.productIcons[category] || this.productIcons['default'];
  }

  getProductImage(category: string, index: number): string {
    const images = this.productImages[category?.toLowerCase()] || this.productImages['default'];
    return images[index % images.length];
  }

  getCategoryColor(category: string): string {
    return this.categoryColors[category?.toLowerCase()] || this.categoryColors['default'];
  }

  onImageError(event: Event, productId: string): void {
    this.imageErrors.add(productId);
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  hasImageError(productId: string): boolean {
    return this.imageErrors.has(productId);
  }

  addToCart(product: Product): void {
    if (product.stock === 0) {
      this.snackBar.open(`We'll notify you when ${product.name} is back in stock!`, 'OK', { 
        duration: 3000,
        panelClass: ['info-snackbar']
      });
    } else {
      this.snackBar.open(`🛒 ${product.name} added to cart!`, 'View Cart', { 
        duration: 3000,
        panelClass: ['cart-snackbar']
      });
    }
  }

  toggleWishlist(product: any): void {
    const wasInWishlist = product.inWishlist;
    product.inWishlist = !product.inWishlist;
    this.cdr.markForCheck();
    
    if (product.inWishlist) {
      // Add to wishlist via API
      this.wishlistService.addItem('product', product._id).subscribe({
        next: () => {
          const snackBarRef = this.snackBar.open(`💖 ${product.name} added to wishlist!`, 'View', { 
            duration: 3000,
            panelClass: ['wishlist-snackbar']
          });
          snackBarRef.onAction().subscribe(() => this.router.navigate(['/wishlist']));
        },
        error: () => {
          product.inWishlist = wasInWishlist;
          this.snackBar.open('Failed to add to wishlist. Please login first.', 'Login', { 
            duration: 3000,
            panelClass: ['error-snackbar']
          }).onAction().subscribe(() => this.router.navigate(['/login']));
          this.cdr.markForCheck();
        }
      });
    } else {
      // Remove from wishlist via API
      this.wishlistService.removeItem(product._id).subscribe({
        next: () => {
          const snackBarRef = this.snackBar.open(`${product.name} removed from wishlist`, 'Undo', { 
            duration: 3000,
            panelClass: ['info-snackbar']
          });
          snackBarRef.onAction().subscribe(() => {
            this.toggleWishlist(product); // Re-add
          });
        },
        error: () => {
          product.inWishlist = wasInWishlist;
          this.snackBar.open('Failed to remove from wishlist', 'OK', { 
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          this.cdr.markForCheck();
        }
      });
    }
  }

  viewProduct(product: Product): void {
    // TODO: Navigate to product detail page or open modal
    this.snackBar.open(`Viewing ${product.name}`, 'Close', { duration: 2000 });
  }

  getStars(rating: number): number[] {
    return Array(Math.floor(rating || 0)).fill(0);
  }
}
