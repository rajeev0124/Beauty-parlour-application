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
import { WishlistService, WishlistItem, Wishlist } from '../../../core/services/wishlist.service';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [
    CommonModule, RouterLink, MatButtonModule, MatIconModule, MatCardModule,
    MatSnackBarModule, MatProgressSpinnerModule, MatChipsModule, MatBadgeModule, MatTooltipModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="wishlist-container">
      <div class="header">
        <h1>
          <mat-icon>favorite</mat-icon>
          My Wishlist
        </h1>
        @if (items.length > 0) {
          <button mat-stroked-button color="warn" (click)="clearAll()">
            <mat-icon>delete_sweep</mat-icon>
            Clear All
          </button>
        }
      </div>

      @if (loading) {
        <div class="loading-state">
          <mat-spinner diameter="48"></mat-spinner>
          <p>Loading your wishlist...</p>
        </div>
      } @else if (items.length === 0) {
        <div class="empty-state">
          <mat-icon>favorite_border</mat-icon>
          <h2>Your wishlist is empty</h2>
          <p>Save your favorite services and products here for easy access</p>
          <div class="action-buttons">
            <a mat-raised-button color="primary" routerLink="/services">
              <mat-icon>spa</mat-icon>
              Browse Services
            </a>
            <a mat-raised-button routerLink="/products">
              <mat-icon>shopping_bag</mat-icon>
              Browse Products
            </a>
          </div>
        </div>
      } @else {
        <!-- On Sale Items Alert -->
        @if (onSaleItems.length > 0) {
          <mat-card class="sale-alert">
            <mat-card-content>
              <mat-icon>sell</mat-icon>
              <span>{{ onSaleItems.length }} item(s) in your wishlist are on sale!</span>
            </mat-card-content>
          </mat-card>
        }

        <div class="wishlist-grid">
          @for (item of items; track item._id) {
            <mat-card class="wishlist-item hover-lift">
              <!-- Sale Badge -->
              @if (item.item && item.item.salePrice && item.item.salePrice < item.item.price) {
                <div class="sale-badge">SALE</div>
              }

              <!-- Item Image -->
              <div class="item-image" [style.backgroundImage]="'url(' + (item.item.image || 'assets/placeholder.jpg') + ')'">
                <button mat-icon-button class="remove-btn" (click)="removeItem(item)" matTooltip="Remove from wishlist">
                  <mat-icon>close</mat-icon>
                </button>
              </div>

              <mat-card-content>
                <!-- Item Type Badge -->
                <mat-chip class="type-chip" [class]="item.itemType">
                  {{ item.itemType | titlecase }}
                </mat-chip>

                <h3>{{ item.item.name }}</h3>
                <p class="description">{{ item.item.description }}</p>

                <!-- Price -->
                <div class="price-row">
                  @if (item.item && item.item.salePrice && item.item.salePrice < item.item.price) {
                    <span class="original-price">₹{{ item.item.price }}</span>
                    <span class="sale-price">₹{{ item.item.salePrice }}</span>
                  } @else {
                    <span class="price">₹{{ item.item.price }}</span>
                  }
                </div>

                <!-- Priority -->
                <div class="priority-row">
                  <span class="label">Priority:</span>
                  <mat-chip-set>
                    @for (p of ['low', 'medium', 'high']; track p) {
                      <mat-chip 
                        [class.selected]="item.priority === p"
                        (click)="updatePriority(item, p)">
                        {{ p | titlecase }}
                      </mat-chip>
                    }
                  </mat-chip-set>
                </div>

                <!-- Notes -->
                @if (item.notes) {
                  <p class="notes">
                    <mat-icon>note</mat-icon>
                    {{ item.notes }}
                  </p>
                }
              </mat-card-content>

              <mat-card-actions>
                @if (item.itemType === 'service') {
                  <a mat-raised-button color="primary" routerLink="/book" [queryParams]="{serviceId: item.itemId}">
                    <mat-icon>calendar_today</mat-icon>
                    Book Now
                  </a>
                } @else {
                  <button mat-raised-button color="primary" (click)="moveToCart(item)">
                    <mat-icon>shopping_cart</mat-icon>
                    Add to Cart
                  </button>
                }
                <button mat-button (click)="addNote(item)">
                  <mat-icon>edit_note</mat-icon>
                  {{ item.notes ? 'Edit Note' : 'Add Note' }}
                </button>
              </mat-card-actions>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .wishlist-container { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    .header h1 { display: flex; align-items: center; gap: 8px; margin: 0; color: #e91e63; }
    .loading-state, .empty-state { text-align: center; padding: 64px 24px; }
    .loading-state p { margin-top: 16px; color: #666; }
    .empty-state mat-icon { font-size: 80px; width: 80px; height: 80px; color: #e0e0e0; }
    .empty-state h2 { margin: 16px 0 8px; color: #333; }
    .empty-state p { color: #666; margin-bottom: 24px; }
    .action-buttons { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
    .sale-alert { background: linear-gradient(135deg, #ff9800, #ff5722); color: white; margin-bottom: 24px; }
    .sale-alert mat-card-content { display: flex; align-items: center; gap: 12px; padding: 16px; }
    .wishlist-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
    .wishlist-item { position: relative; overflow: hidden; transition: all 0.3s; }
    .wishlist-item:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(233, 30, 99, 0.15); }
    .sale-badge { position: absolute; top: 12px; left: 12px; background: #e91e63; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; z-index: 10; }
    .item-image { height: 180px; background-size: cover; background-position: center; position: relative; }
    .remove-btn { position: absolute; top: 8px; right: 8px; background: rgba(255,255,255,0.9); }
    mat-card-content { padding: 16px; }
    .type-chip { font-size: 11px; margin-bottom: 8px; }
    .type-chip.service { background: #e8f5e9; color: #388e3c; }
    .type-chip.product { background: #e3f2fd; color: #1976d2; }
    .type-chip.package { background: #fce4ec; color: #c2185b; }
    h3 { margin: 8px 0; font-size: 18px; }
    .description { color: #666; font-size: 14px; margin-bottom: 12px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .price-row { margin-bottom: 12px; }
    .original-price { text-decoration: line-through; color: #999; margin-right: 8px; }
    .sale-price { font-size: 20px; font-weight: 600; color: #e91e63; }
    .price { font-size: 20px; font-weight: 600; color: #333; }
    .priority-row { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
    .priority-row .label { font-size: 12px; color: #666; }
    .priority-row mat-chip { font-size: 11px; cursor: pointer; }
    .priority-row mat-chip.selected { background: #e91e63; color: white; }
    .notes { display: flex; align-items: flex-start; gap: 4px; font-size: 13px; color: #666; background: #f5f5f5; padding: 8px; border-radius: 4px; margin-top: 8px; }
    .notes mat-icon { font-size: 16px; width: 16px; height: 16px; }
    mat-card-actions { border-top: 1px solid #eee; display: flex; justify-content: space-between; flex-wrap: wrap; }
  `]
})
export class WishlistComponent implements OnInit {
  loading = true;
  items: WishlistItem[] = [];
  onSaleItems: WishlistItem[] = [];

  constructor(
    private wishlistService: WishlistService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadWishlist();
  }

  loadWishlist(): void {
    this.loading = true;
    this.wishlistService.getWishlist().subscribe({
      next: (wishlist) => {
        this.items = wishlist?.items || [];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
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

  removeItem(item: WishlistItem): void {
    this.wishlistService.removeItem(item.itemId).subscribe({
      next: () => {
        this.snackBar.open('Removed from wishlist', 'Close', { duration: 3000 });
        this.loadWishlist();
      },
      error: () => this.snackBar.open('Failed to remove item', 'Close', { duration: 3000 })
    });
  }

  updatePriority(item: WishlistItem, priority: string): void {
    this.wishlistService.updateItem(item.itemId, { priority }).subscribe({
      next: () => {
        item.priority = priority as any;
        this.snackBar.open('Priority updated', 'Close', { duration: 2000 });
        this.cdr.markForCheck();
      }
    });
  }

  addNote(item: WishlistItem): void {
    const note = prompt('Enter a note:', item.notes || '');
    if (note !== null) {
      this.wishlistService.updateItem(item.itemId, { notes: note }).subscribe({
        next: () => {
          item.notes = note;
          this.snackBar.open('Note saved', 'Close', { duration: 2000 });
          this.cdr.markForCheck();
        }
      });
    }
  }

  moveToCart(item: WishlistItem): void {
    this.wishlistService.moveToCart(item.itemId).subscribe({
      next: () => {
        this.snackBar.open('Added to cart!', 'Close', { duration: 3000 });
        this.loadWishlist();
      },
      error: () => this.snackBar.open('Failed to add to cart', 'Close', { duration: 3000 })
    });
  }

  clearAll(): void {
    if (confirm('Clear all items from your wishlist?')) {
      this.wishlistService.clearWishlist().subscribe({
        next: () => {
          this.snackBar.open('Wishlist cleared', 'Close', { duration: 3000 });
          this.items = [];
          this.cdr.markForCheck();
        },
        error: () => this.snackBar.open('Failed to clear wishlist', 'Close', { duration: 3000 })
      });
    }
  }
}
