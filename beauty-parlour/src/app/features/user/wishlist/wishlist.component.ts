import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { WishlistService, WishlistItem, Wishlist } from '../../../core/services/wishlist.service';
import { PremiumPromptDialogComponent } from '../../../shared/premium-prompt-dialog.component';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [
    CommonModule, RouterLink, MatButtonModule, MatIconModule, MatCardModule,
    MatSnackBarModule, MatProgressSpinnerModule, MatChipsModule, MatBadgeModule, MatTooltipModule,
    MatDialogModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.scss'
})
export class WishlistComponent implements OnInit {
  loading = true;
  items: WishlistItem[] = [];
  onSaleItems: WishlistItem[] = [];

  // Fallback images for items without images (same as products page)
  private productImages: Record<string, string[]> = {
    hair: [
      'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=400&q=80',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80',
      'https://images.unsplash.com/photo-1626015365107-aa4f5d89fd6a?w=400&q=80'
    ],
    skin: [
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80',
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&q=80',
      'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400&q=80'
    ],
    makeup: [
      'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&q=80',
      'https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=400&q=80',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80'
    ],
    nails: [
      'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&q=80',
      'https://images.unsplash.com/photo-1610992015732-2449b0dd2b3f?w=400&q=80'
    ],
    tools: [
      'https://images.unsplash.com/photo-1522338140262-f46f5913618a?w=400&q=80',
      'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400&q=80'
    ],
    default: [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80',
      'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400&q=80'
    ]
  };

  // Service fallback images
  private serviceImages: Record<string, string[]> = {
    hair: [
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80',
      'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=400&q=80'
    ],
    skin: [
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&q=80',
      'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400&q=80'
    ],
    bridal: [
      'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&q=80',
      'https://images.unsplash.com/photo-1457972729786-0411a3b2b626?w=400&q=80'
    ],
    nails: [
      'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&q=80',
      'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=400&q=80'
    ],
    default: [
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80'
    ]
  };

  constructor(
    private wishlistService: WishlistService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadWishlist();
  }

  loadWishlist(): void {
    this.loading = true;
    this.wishlistService.getWishlist().subscribe({
      next: (wishlist) => {
        // Handle both array response and object with items property
        let rawItems: any[];
        if (Array.isArray(wishlist)) {
          rawItems = wishlist;
        } else {
          rawItems = wishlist?.items || [];
        }
        
        // Map items to ensure itemId is available (backend returns item._id after populate)
        this.items = rawItems.map((item: any) => ({
          ...item,
          itemId: item.itemId || item.item?._id || item.item
        }));
        
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Wishlist load error:', err);
        this.items = [];
        this.loading = false;
        this.cdr.markForCheck();
      }
    });

    this.wishlistService.getOnSaleItems().subscribe({
      next: (items) => {
        this.onSaleItems = items;
        this.cdr.markForCheck();
      }
    });
  }

  getDiscount(original: number, sale: number): number {
    return Math.round(((original - sale) / original) * 100);
  }

  getItemImage(item: WishlistItem, index: number): string {
    // If item has an image from database, use it
    if (item.item?.image) {
      return item.item.image;
    }
    
    // Otherwise use consistent fallback based on item ID hash (same logic as products page)
    const category = (item.item as any)?.category?.toLowerCase() || 'default';
    const itemId = item.itemId || item.item?._id || '';
    let images: string[];
    
    if (item.itemType === 'service') {
      images = this.serviceImages[category] || this.serviceImages['default'];
    } else {
      images = this.productImages[category] || this.productImages['default'];
    }
    
    // Use same hash algorithm as products page for consistency
    let hash = 0;
    for (let i = 0; i < itemId.length; i++) {
      hash = ((hash << 5) - hash) + itemId.charCodeAt(i);
      hash = hash & hash;
    }
    const imageIndex = Math.abs(hash || index) % images.length;
    
    return images[imageIndex];
  }

  removeItem(item: WishlistItem): void {
    this.wishlistService.removeItem(item.itemId).subscribe({
      next: () => {
        this.snackBar.open('✓ Removed from wishlist', 'OK', { 
          duration: 4000,
          panelClass: ['warning-snackbar'],
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        this.loadWishlist();
      },
      error: () => this.snackBar.open('Failed to remove item', 'Retry', { 
        duration: 4000,
        panelClass: ['error-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'top'
      })
    });
  }

  updatePriority(item: WishlistItem, priority: string): void {
    this.wishlistService.updateItem(item.itemId, { priority }).subscribe({
      next: () => {
        item.priority = priority as any;
        this.snackBar.open('Priority updated', 'OK', { 
          duration: 2000,
          panelClass: ['success-snackbar'],
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        this.cdr.markForCheck();
      }
    });
  }

  addNote(item: WishlistItem): void {
    const dialogRef = this.dialog.open(PremiumPromptDialogComponent, {
      data: {
        title: 'Add a Note',
        message: 'Add a personal note to remember why you saved this item',
        placeholder: 'e.g., "Perfect for summer!" or "Gift idea for Mom"',
        defaultValue: item.notes || '',
        inputType: 'textarea',
        icon: 'edit_note',
        type: 'info',
        confirmText: 'Save Note'
      },
      panelClass: 'premium-dialog'
    });

    dialogRef.afterClosed().subscribe(note => {
      if (note !== null && note !== undefined) {
        this.wishlistService.updateItem(item.itemId, { notes: note }).subscribe({
          next: () => {
            item.notes = note;
            this.snackBar.open('✨ Note saved!', 'OK', {
              duration: 3000,
              panelClass: ['success-snackbar'],
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
            this.cdr.markForCheck();
          }
        });
      }
    });
  }

  moveToCart(item: WishlistItem): void {
    this.wishlistService.moveToCart(item.itemId).subscribe({
      next: () => {
        this.snackBar.open('🛒 Added to cart!', 'OK', { 
          duration: 3000,
          panelClass: ['success-snackbar'],
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        this.loadWishlist();
      },
      error: () => this.snackBar.open('Failed to add to cart', 'Retry', { 
        duration: 3000,
        panelClass: ['error-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'top'
      })
    });
  }

  clearAll(): void {
    if (confirm('Clear all items from your wishlist?')) {
      this.wishlistService.clearWishlist().subscribe({
        next: () => {
          this.snackBar.open('Wishlist cleared', 'OK', { duration: 3000 });
          this.items = [];
          this.cdr.markForCheck();
        },
        error: () => this.snackBar.open('Failed to clear wishlist', 'Retry', { duration: 3000 })
      });
    }
  }
}
