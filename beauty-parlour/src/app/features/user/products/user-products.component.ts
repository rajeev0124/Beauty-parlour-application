import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductService } from '../../../core/services/product.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { CartService } from '../../../core/services/cart.service';
import { Product } from '../../../core/models/product.model';
import { SkinQuizComponent } from '../../../shared/components/skin-quiz/skin-quiz.component';
import { AutoMovingImageComponent } from '../../../shared/components/auto-moving-image/auto-moving-image.component';
import { TypewriterTextComponent } from '../../../shared/components/typewriter-text/typewriter-text.component';

@Component({
  selector: 'app-user-products',
  standalone: true,
  imports: [DecimalPipe, MatIconModule, MatButtonModule, MatSnackBarModule, SkinQuizComponent, AutoMovingImageComponent, TypewriterTextComponent],
  templateUrl: './user-products.component.html',
  styleUrl: './user-products.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserProductsComponent implements OnInit {
  @ViewChild('skinQuiz') skinQuiz!: SkinQuizComponent;
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
    { key: 'nails', label: 'Nail Care', icon: 'local_florist', count: 0 },
    { key: 'tools', label: 'Tools', icon: 'construction', count: 0 },
  ];

  products: Product[] = [];

  // Product icon mapping by category
  private productIcons: Record<string, string> = {
    hair: 'content_cut',
    skin: 'face_retouching_natural',
    makeup: 'brush',
    nails: 'local_florist',
    tools: 'construction',
    default: 'inventory_2'
  };

  // Category fallback images (100% exact local product assets)
  private categoryDefaultImages: Record<string, string> = {
    hair: '/products/keratin-shampoo.png',
    skin: '/products/vit-c-facewash.png',
    makeup: '/products/matte-lipstick-set.png',
    nails: '/products/gel-nail-kit.png',
    tools: '/products/hair-dryer.png',
    default: '/products/keratin-shampoo.png'
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
    public cartService: CartService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  // Multi-angle product photo galleries (100% exact matching product photographs)
  private readonly productGalleries: Record<string, string[]> = {
    'keratin shampoo': [
      '/products/keratin-shampoo.png'
    ],
    'argan oil conditioner': [
      '/products/argan-conditioner.png'
    ],
    'hair serum – silk shine': [
      '/products/hair-serum.png'
    ],
    'hair serum': [
      '/products/hair-serum.png'
    ],
    'leave-in hair mask': [
      '/products/hair-mask.png'
    ],
    'vitamin c face wash': [
      '/products/vit-c-facewash.png'
    ],
    'hyaluronic moisturizer': [
      '/products/hyaluronic-moisturizer.png'
    ],
    'sunscreen spf 50+': [
      '/products/sunscreen-spf50.png'
    ],
    'night repair cream': [
      '/products/night-repair-cream.png'
    ],
    'matte lipstick set': [
      '/products/matte-lipstick-set.png'
    ],
    'foundation – natural glow': [
      '/products/foundation-glow.png'
    ],
    'foundation': [
      '/products/foundation-glow.png'
    ],
    'eye shadow palette': [
      '/products/eyeshadow-palette.png'
    ],
    'gel nail polish kit': [
      '/products/gel-nail-kit.png'
    ],
    'nail art stickers': [
      '/products/nail-stickers.png'
    ],
    'cuticle oil': [
      '/products/cuticle-oil.png'
    ],
    'professional hair dryer': [
      '/products/hair-dryer.png'
    ],
    'hair dryer': [
      '/products/hair-dryer.png'
    ],
    'straightening iron': [
      '/products/straightening-iron.png'
    ],
    'makeup brush set (12 pcs)': [
      '/products/makeup-brushes.png'
    ],
    'makeup brush set': [
      '/products/makeup-brushes.png'
    ]
  };

  loadProducts(): void {
    this.loading = true;
    this.errorMessage = '';
    this.productService.getAll().subscribe({
      next: (products) => {
        this.products = products.map((p, index) => ({ 
          ...p, 
          inWishlist: false,
          displayImages: this.getProductGallery(p, index)
        }));
        this.updateCategoryCounts();
        this.loading = false;
        this.cdr.markForCheck();
        
        this.loadWishlistStatus();
      },
      error: () => {
        this.errorMessage = 'Failed to load products. Please try again later.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  // Get multi-angle photo gallery for product auto-slider
  getProductGallery(product: Product, index: number): string[] {
    const cleanName = (product.name || '').toLowerCase().trim();
    if (this.productGalleries[cleanName]) {
      return this.productGalleries[cleanName];
    }
    for (const [key, list] of Object.entries(this.productGalleries)) {
      if (cleanName.includes(key) || key.includes(cleanName)) {
        return list;
      }
    }
    if (product.image) {
      return [product.image];
    }
    return [this.getProductImage(product.category, index)];
  }

  // Generate consistent image based on category fallback
  private getConsistentImage(productId: string, category: string, fallbackIndex: number): string {
    return this.categoryDefaultImages[category?.toLowerCase()] || this.categoryDefaultImages['default'];
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
    return this.categoryDefaultImages[category?.toLowerCase()] || this.categoryDefaultImages['default'];
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
      this.cartService.addItem(product, 1);
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
          this.snackBar.open('Failed to add to wishlist.', 'Close', { 
            duration: 4000,
            panelClass: ['error-snackbar'],
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
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

  quickViewProduct: any = null;
  quickViewQty = 1;
  selectedGalleryImage = '';
  productGallery: string[] = [];

  openQuickView(product: Product): void {
    const cleanName = (product.name || '').toLowerCase().trim();
    let gallery: string[] = (product as any).displayImages || [];
    
    if (!gallery || !gallery.length) {
      if (this.productGalleries[cleanName]) {
        gallery = this.productGalleries[cleanName];
      } else {
        for (const [key, list] of Object.entries(this.productGalleries)) {
          if (cleanName.includes(key) || key.includes(cleanName)) {
            gallery = list;
            break;
          }
        }
      }
    }
    
    if (!gallery || !gallery.length) {
      if (product.image && product.image.startsWith('/products/')) {
        gallery = [product.image];
      } else {
        gallery = [this.categoryDefaultImages[product.category?.toLowerCase()] || '/products/keratin-shampoo.png'];
      }
    }

    this.productGallery = gallery;
    this.selectedGalleryImage = gallery[0] || '/products/keratin-shampoo.png';
    this.quickViewProduct = product;
    this.quickViewQty = 1;
    this.cdr.markForCheck();
  }

  closeQuickView(): void {
    this.quickViewProduct = null;
    this.cdr.markForCheck();
  }

  setQuickViewImage(img: string): void {
    this.selectedGalleryImage = img;
  }

  updateQuickViewQty(delta: number): void {
    const next = this.quickViewQty + delta;
    if (next >= 1 && next <= (this.quickViewProduct?.stock || 99)) {
      this.quickViewQty = next;
    }
  }

  addQuickViewToCart(): void {
    if (!this.quickViewProduct) return;
    this.cartService.addItem(this.quickViewProduct, this.quickViewQty);
    this.closeQuickView();
  }

  viewProduct(product: Product): void {
    this.openQuickView(product);
  }

  getStars(rating: number): number[] {
    return Array(Math.floor(rating || 0)).fill(0);
  }
}
