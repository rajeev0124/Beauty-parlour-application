import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AddStockDialogComponent } from './add-stock-dialog.component';

interface InventoryItem {
  _id: string;
  name: string;
  category: string;
  stock: number;
  price: number;
  image?: string;
  minStock?: number;
  lastUpdated?: Date;
}

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatTableModule, MatPaginatorModule, MatSortModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule,
    MatCardModule, MatDialogModule, MatSnackBarModule, MatChipsModule,
    MatProgressSpinnerModule, MatBadgeModule, MatTooltipModule, TitleCasePipe
  ],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="inv-page">
      <!-- Header -->
      <div class="inv-header">
        <div class="inv-header-left">
          <div class="inv-header-icon">
            <mat-icon>inventory_2</mat-icon>
          </div>
          <div class="inv-header-text">
            <h1>Inventory Management</h1>
            <p>Track and manage your product stock levels</p>
          </div>
        </div>
        <div class="inv-header-actions">
          <button class="inv-btn secondary" (click)="showLowStock()" [class.active]="filterMode === 'low'">
            <mat-icon>warning</mat-icon>
            <span class="btn-text">Low Stock</span>
            <span class="badge warn">{{ lowStockCount }}</span>
          </button>
          <button class="inv-btn primary" (click)="openAddStockDialog()">
            <mat-icon>add</mat-icon>
            <span class="btn-text">Add Stock</span>
          </button>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="inv-stats">
        <div class="stat-card products">
          <div class="stat-icon">
            <mat-icon>shopping_bag</mat-icon>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ totalProducts }}</span>
            <span class="stat-label">Total Products</span>
          </div>
          <div class="stat-bg"></div>
        </div>
        
        <div class="stat-card stock">
          <div class="stat-icon">
            <mat-icon>layers</mat-icon>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ totalStock | number }}</span>
            <span class="stat-label">Total Stock</span>
          </div>
          <div class="stat-bg"></div>
        </div>
        
        <div class="stat-card low">
          <div class="stat-icon">
            <mat-icon>trending_down</mat-icon>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ lowStockCount }}</span>
            <span class="stat-label">Low Stock Items</span>
          </div>
          <div class="stat-bg"></div>
        </div>
        
        <div class="stat-card value">
          <div class="stat-icon">
            <mat-icon>account_balance_wallet</mat-icon>
          </div>
          <div class="stat-content">
            <span class="stat-value">₹{{ totalValue | number:'1.0-0' }}</span>
            <span class="stat-label">Inventory Value</span>
          </div>
          <div class="stat-bg"></div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="inv-main">
        <!-- Toolbar -->
        <div class="inv-toolbar">
          <div class="inv-search">
            <mat-icon>search</mat-icon>
            <input type="text" placeholder="Search products..." (input)="applyFilter($event)" #searchInput>
            @if (searchInput.value) {
              <button class="clear-btn" (click)="clearSearch(searchInput)">
                <mat-icon>close</mat-icon>
              </button>
            }
          </div>
          <div class="inv-filters">
            <button class="filter-chip" [class.active]="filterMode === 'all'" (click)="setFilter('all')">
              All Products
            </button>
            <button class="filter-chip" [class.active]="filterMode === 'instock'" (click)="setFilter('instock')">
              <span class="dot green"></span> In Stock
            </button>
            <button class="filter-chip" [class.active]="filterMode === 'low'" (click)="setFilter('low')">
              <span class="dot orange"></span> Low Stock
            </button>
            <button class="filter-chip" [class.active]="filterMode === 'out'" (click)="setFilter('out')">
              <span class="dot red"></span> Out of Stock
            </button>
          </div>
        </div>

        <!-- Loading -->
        @if (loading) {
          <div class="inv-loading">
            <div class="loading-spinner"></div>
            <p>Loading inventory...</p>
          </div>
        } @else if (filteredData.length === 0) {
          <div class="inv-empty">
            <div class="empty-icon">
              <mat-icon>inventory_2</mat-icon>
            </div>
            <h3>No products found</h3>
            <p>Try adjusting your search or filters</p>
            <button class="inv-btn secondary" (click)="resetFilters(searchInput)">
              <mat-icon>refresh</mat-icon> Reset Filters
            </button>
          </div>
        } @else {
          <!-- Desktop Table View -->
          <div class="inv-table-wrap">
            <table class="inv-table">
              <thead>
                <tr>
                  <th class="col-product">Product</th>
                  <th class="col-category">Category</th>
                  <th class="col-stock">Stock</th>
                  <th class="col-price">Price</th>
                  <th class="col-value">Total Value</th>
                  <th class="col-status">Status</th>
                  <th class="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (item of paginatedData; track item._id) {
                  <tr [class.low-stock-row]="item.stock <= 10 && item.stock > 0" [class.out-stock-row]="item.stock === 0">
                    <td class="col-product">
                      <div class="product-cell">
                        <div class="product-avatar" [style.background]="getCategoryGradient(item.category)">
                          @if (item.image) {
                            <img [src]="item.image" [alt]="item.name">
                          } @else {
                            <span>{{ getCategoryIcon(item.category) }}</span>
                          }
                        </div>
                        <span class="product-name">{{ item.name }}</span>
                      </div>
                    </td>
                    <td class="col-category">
                      <span class="category-tag" [style.background]="getCategoryBg(item.category)" [style.color]="getCategoryColor(item.category)">
                        {{ item.category | titlecase }}
                      </span>
                    </td>
                    <td class="col-stock">
                      <div class="stock-display" [class]="getStockClass(item.stock)">
                        <span class="stock-num">{{ item.stock }}</span>
                        <span class="stock-unit">units</span>
                      </div>
                    </td>
                    <td class="col-price">
                      <span class="price-value">₹{{ item.price | number:'1.0-0' }}</span>
                    </td>
                    <td class="col-value">
                      <span class="total-value">₹{{ item.stock * item.price | number:'1.0-0' }}</span>
                    </td>
                    <td class="col-status">
                      @if (item.stock === 0) {
                        <span class="status-badge out">
                          <mat-icon>error</mat-icon> Out of Stock
                        </span>
                      } @else if (item.stock <= 10) {
                        <span class="status-badge low">
                          <mat-icon>warning</mat-icon> Low Stock
                        </span>
                      } @else {
                        <span class="status-badge good">
                          <mat-icon>check_circle</mat-icon> In Stock
                        </span>
                      }
                    </td>
                    <td class="col-actions">
                      <div class="action-btns">
                        <button class="action-btn add" (click)="addStock(item)" matTooltip="Add Stock">
                          <mat-icon>add</mat-icon>
                        </button>
                        <button class="action-btn remove" (click)="reduceStock(item)" matTooltip="Reduce Stock" [disabled]="item.stock === 0">
                          <mat-icon>remove</mat-icon>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Mobile Card View -->
          <div class="inv-cards">
            @for (item of paginatedData; track item._id) {
              <div class="inv-card" [class.low-stock]="item.stock <= 10 && item.stock > 0" [class.out-stock]="item.stock === 0">
                <div class="card-header">
                  <div class="product-avatar" [style.background]="getCategoryGradient(item.category)">
                    @if (item.image) {
                      <img [src]="item.image" [alt]="item.name">
                    } @else {
                      <span>{{ getCategoryIcon(item.category) }}</span>
                    }
                  </div>
                  <div class="card-info">
                    <h4>{{ item.name }}</h4>
                    <span class="category-tag" [style.background]="getCategoryBg(item.category)" [style.color]="getCategoryColor(item.category)">
                      {{ item.category | titlecase }}
                    </span>
                  </div>
                  @if (item.stock === 0) {
                    <span class="status-dot out"></span>
                  } @else if (item.stock <= 10) {
                    <span class="status-dot low"></span>
                  } @else {
                    <span class="status-dot good"></span>
                  }
                </div>
                <div class="card-body">
                  <div class="card-stat">
                    <span class="stat-label">Stock</span>
                    <span class="stat-value" [class]="getStockClass(item.stock)">{{ item.stock }} units</span>
                  </div>
                  <div class="card-stat">
                    <span class="stat-label">Price</span>
                    <span class="stat-value">₹{{ item.price | number:'1.0-0' }}</span>
                  </div>
                  <div class="card-stat">
                    <span class="stat-label">Total Value</span>
                    <span class="stat-value">₹{{ item.stock * item.price | number:'1.0-0' }}</span>
                  </div>
                </div>
                <div class="card-footer">
                  @if (item.stock === 0) {
                    <span class="status-badge out">
                      <mat-icon>error</mat-icon> Out of Stock
                    </span>
                  } @else if (item.stock <= 10) {
                    <span class="status-badge low">
                      <mat-icon>warning</mat-icon> Low Stock
                    </span>
                  } @else {
                    <span class="status-badge good">
                      <mat-icon>check_circle</mat-icon> In Stock
                    </span>
                  }
                  <div class="action-btns">
                    <button class="action-btn add" (click)="addStock(item)">
                      <mat-icon>add</mat-icon>
                    </button>
                    <button class="action-btn remove" (click)="reduceStock(item)" [disabled]="item.stock === 0">
                      <mat-icon>remove</mat-icon>
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Pagination -->
          <div class="inv-pagination">
            <div class="pagination-info">
              Showing {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, filteredData.length) }} of {{ filteredData.length }} products
            </div>
            <div class="pagination-controls">
              <button class="page-btn" (click)="goToPage(1)" [disabled]="currentPage === 1">
                <mat-icon>first_page</mat-icon>
              </button>
              <button class="page-btn" (click)="goToPage(currentPage - 1)" [disabled]="currentPage === 1">
                <mat-icon>chevron_left</mat-icon>
              </button>
              <span class="page-num">{{ currentPage }} / {{ totalPages }}</span>
              <button class="page-btn" (click)="goToPage(currentPage + 1)" [disabled]="currentPage === totalPages">
                <mat-icon>chevron_right</mat-icon>
              </button>
              <button class="page-btn" (click)="goToPage(totalPages)" [disabled]="currentPage === totalPages">
                <mat-icon>last_page</mat-icon>
              </button>
            </div>
            <div class="page-size">
              <span>Per page:</span>
              <select [(ngModel)]="pageSize" (change)="onPageSizeChange()">
                <option [value]="10">10</option>
                <option [value]="25">25</option>
                <option [value]="50">50</option>
              </select>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .inv-page {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
      font-family: 'Inter', -apple-system, sans-serif;
    }

    // ========== HEADER ==========
    .inv-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 28px;
      flex-wrap: wrap;
      gap: 20px;
    }

    .inv-header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .inv-header-icon {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      background: linear-gradient(135deg, #10b981, #059669);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 24px rgba(16, 185, 129, 0.35);

      mat-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
        color: #fff;
      }
    }

    .inv-header-text {
      h1 {
        margin: 0;
        font-size: 26px;
        font-weight: 700;
        color: #1f2937;
      }

      p {
        margin: 4px 0 0;
        font-size: 14px;
        color: #6b7280;
      }
    }

    .inv-header-actions {
      display: flex;
      gap: 12px;
    }

    .inv-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      border: none;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      &.primary {
        background: linear-gradient(135deg, #10b981, #059669);
        color: #fff;
        box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.45);
        }
      }

      &.secondary {
        background: #fff;
        color: #4b5563;
        border: 2px solid #e5e7eb;

        &:hover, &.active {
          border-color: #f59e0b;
          color: #f59e0b;
          background: #fffbeb;
        }

        .badge {
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 700;

          &.warn {
            background: #fef3c7;
            color: #d97706;
          }
        }
      }
    }

    // ========== STATS ==========
    .inv-stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 28px;
    }

    .stat-card {
      position: relative;
      padding: 24px;
      border-radius: 20px;
      background: #fff;
      border: 1px solid #e5e7eb;
      overflow: hidden;
      display: flex;
      align-items: center;
      gap: 16px;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
      }

      .stat-icon {
        width: 56px;
        height: 56px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        z-index: 1;

        mat-icon {
          font-size: 26px;
          width: 26px;
          height: 26px;
        }
      }

      .stat-content {
        display: flex;
        flex-direction: column;
        z-index: 1;

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          line-height: 1.2;
        }

        .stat-label {
          font-size: 13px;
          color: #6b7280;
          margin-top: 4px;
        }
      }

      .stat-bg {
        position: absolute;
        right: -20px;
        bottom: -20px;
        width: 100px;
        height: 100px;
        border-radius: 50%;
        opacity: 0.1;
      }

      &.products {
        .stat-icon { background: #dbeafe; color: #2563eb; }
        .stat-content .stat-value { color: #2563eb; }
        .stat-bg { background: #2563eb; }
      }

      &.stock {
        .stat-icon { background: #d1fae5; color: #059669; }
        .stat-content .stat-value { color: #059669; }
        .stat-bg { background: #059669; }
      }

      &.low {
        .stat-icon { background: #fef3c7; color: #d97706; }
        .stat-content .stat-value { color: #d97706; }
        .stat-bg { background: #d97706; }
      }

      &.value {
        .stat-icon { background: #ede9fe; color: #7c3aed; }
        .stat-content .stat-value { color: #7c3aed; }
        .stat-bg { background: #7c3aed; }
      }
    }

    // ========== MAIN ==========
    .inv-main {
      background: #fff;
      border-radius: 20px;
      border: 1px solid #e5e7eb;
      overflow: hidden;
    }

    .inv-toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 16px;
      padding: 20px 24px;
      border-bottom: 1px solid #f3f4f6;
      background: #fafafa;
    }

    .inv-search {
      flex: 1;
      min-width: 240px;
      max-width: 400px;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: #fff;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      transition: all 0.2s ease;

      &:focus-within {
        border-color: #10b981;
        box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
      }

      mat-icon {
        color: #9ca3af;
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      input {
        flex: 1;
        border: none;
        outline: none;
        font-size: 14px;
        color: #1f2937;
        background: transparent;

        &::placeholder {
          color: #9ca3af;
        }
      }

      .clear-btn {
        width: 24px;
        height: 24px;
        border: none;
        background: #f3f4f6;
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        
        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
          color: #6b7280;
        }

        &:hover {
          background: #e5e7eb;
        }
      }
    }

    .inv-filters {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .filter-chip {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border: 1px solid #e5e7eb;
      border-radius: 20px;
      background: #fff;
      font-size: 13px;
      font-weight: 500;
      color: #6b7280;
      cursor: pointer;
      transition: all 0.15s ease;

      &:hover {
        border-color: #d1d5db;
        background: #f9fafb;
      }

      &.active {
        border-color: #10b981;
        background: #ecfdf5;
        color: #059669;
      }

      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;

        &.green { background: #10b981; }
        &.orange { background: #f59e0b; }
        &.red { background: #ef4444; }
      }
    }

    // ========== LOADING & EMPTY ==========
    .inv-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
      gap: 16px;

      .loading-spinner {
        width: 48px;
        height: 48px;
        border: 4px solid #e5e7eb;
        border-top-color: #10b981;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      p {
        color: #6b7280;
        font-size: 14px;
      }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .inv-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
      text-align: center;

      .empty-icon {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: #f3f4f6;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 20px;

        mat-icon {
          font-size: 40px;
          width: 40px;
          height: 40px;
          color: #9ca3af;
        }
      }

      h3 {
        margin: 0 0 8px;
        font-size: 18px;
        color: #1f2937;
      }

      p {
        margin: 0 0 20px;
        color: #6b7280;
      }
    }

    // ========== TABLE ==========
    .inv-table-wrap {
      overflow-x: auto;
    }

    .inv-table {
      width: 100%;
      border-collapse: collapse;

      th {
        padding: 14px 20px;
        text-align: left;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #6b7280;
        background: #f9fafb;
        border-bottom: 1px solid #e5e7eb;
        white-space: nowrap;
      }

      td {
        padding: 16px 20px;
        border-bottom: 1px solid #f3f4f6;
        vertical-align: middle;
      }

      tbody tr {
        transition: background 0.15s ease;

        &:hover {
          background: #f9fafb;
        }

        &.low-stock-row {
          background: #fffbeb;
          &:hover { background: #fef3c7; }
        }

        &.out-stock-row {
          background: #fef2f2;
          &:hover { background: #fee2e2; }
        }
      }
    }

    .product-cell {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .product-avatar {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      flex-shrink: 0;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .product-name {
      font-weight: 600;
      color: #1f2937;
    }

    .category-tag {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 600;
    }

    .stock-display {
      display: flex;
      align-items: baseline;
      gap: 4px;

      .stock-num {
        font-size: 18px;
        font-weight: 700;
      }

      .stock-unit {
        font-size: 12px;
        color: #9ca3af;
      }

      &.stock-good .stock-num { color: #059669; }
      &.stock-medium .stock-num { color: #d97706; }
      &.stock-low .stock-num { color: #dc2626; }
    }

    .price-value {
      font-weight: 600;
      color: #374151;
    }

    .total-value {
      font-weight: 700;
      color: #7c3aed;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;

      mat-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
      }

      &.good {
        background: #d1fae5;
        color: #059669;
      }

      &.low {
        background: #fef3c7;
        color: #d97706;
      }

      &.out {
        background: #fee2e2;
        color: #dc2626;
      }
    }

    .action-btns {
      display: flex;
      gap: 8px;
    }

    .action-btn {
      width: 36px;
      height: 36px;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      &.add {
        background: #d1fae5;
        color: #059669;

        &:hover {
          background: #10b981;
          color: #fff;
        }
      }

      &.remove {
        background: #fee2e2;
        color: #dc2626;

        &:hover:not(:disabled) {
          background: #ef4444;
          color: #fff;
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }
    }

    // ========== CARDS (Mobile) ==========
    .inv-cards {
      display: none;
      padding: 16px;
      gap: 16px;
    }

    .inv-card {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 16px;
      overflow: hidden;
      transition: all 0.2s ease;

      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      }

      &.low-stock {
        border-color: #fcd34d;
        background: #fffbeb;
      }

      &.out-stock {
        border-color: #fca5a5;
        background: #fef2f2;
      }

      .card-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        border-bottom: 1px solid #f3f4f6;
        position: relative;

        .product-avatar {
          width: 48px;
          height: 48px;
        }

        .card-info {
          flex: 1;

          h4 {
            margin: 0 0 6px;
            font-size: 15px;
            font-weight: 600;
            color: #1f2937;
          }
        }

        .status-dot {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 12px;
          height: 12px;
          border-radius: 50%;

          &.good { background: #10b981; }
          &.low { background: #f59e0b; }
          &.out { background: #ef4444; }
        }
      }

      .card-body {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        padding: 16px;
        gap: 12px;

        .card-stat {
          text-align: center;

          .stat-label {
            display: block;
            font-size: 11px;
            color: #9ca3af;
            text-transform: uppercase;
            margin-bottom: 4px;
          }

          .stat-value {
            font-size: 14px;
            font-weight: 600;
            color: #1f2937;

            &.stock-good { color: #059669; }
            &.stock-medium { color: #d97706; }
            &.stock-low { color: #dc2626; }
          }
        }
      }

      .card-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        background: #f9fafb;
        border-top: 1px solid #f3f4f6;
      }
    }

    // ========== PAGINATION ==========
    .inv-pagination {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 16px;
      padding: 16px 24px;
      border-top: 1px solid #e5e7eb;
      background: #f9fafb;
    }

    .pagination-info {
      font-size: 13px;
      color: #6b7280;
    }

    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .page-btn {
      width: 36px;
      height: 36px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      background: #fff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        color: #6b7280;
      }

      &:hover:not(:disabled) {
        border-color: #10b981;
        background: #ecfdf5;

        mat-icon { color: #059669; }
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .page-num {
      padding: 0 12px;
      font-size: 14px;
      font-weight: 600;
      color: #374151;
    }

    .page-size {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #6b7280;

      select {
        padding: 8px 12px;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        background: #fff;
        font-size: 13px;
        cursor: pointer;
        outline: none;

        &:focus {
          border-color: #10b981;
        }
      }
    }

    // ========== RESPONSIVE ==========
    @media (max-width: 1024px) {
      .inv-stats {
        grid-template-columns: repeat(2, 1fr);
      }

      .inv-table .col-value,
      .inv-table .col-status {
        display: none;
      }
    }

    @media (max-width: 768px) {
      .inv-page {
        padding: 16px;
      }

      .inv-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .inv-header-actions {
        width: 100%;

        .inv-btn {
          flex: 1;
          justify-content: center;
        }
      }

      .inv-stats {
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }

      .stat-card {
        padding: 16px;

        .stat-icon {
          width: 44px;
          height: 44px;

          mat-icon {
            font-size: 22px;
            width: 22px;
            height: 22px;
          }
        }

        .stat-content {
          .stat-value {
            font-size: 22px;
          }

          .stat-label {
            font-size: 12px;
          }
        }
      }

      .inv-toolbar {
        padding: 16px;
      }

      .inv-search {
        min-width: 100%;
        max-width: 100%;
      }

      .inv-filters {
        width: 100%;
        overflow-x: auto;
        flex-wrap: nowrap;
        padding-bottom: 4px;

        &::-webkit-scrollbar {
          display: none;
        }
      }

      .filter-chip {
        flex-shrink: 0;
      }

      .inv-table-wrap {
        display: none;
      }

      .inv-cards {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
      }

      .inv-pagination {
        flex-direction: column;
        gap: 12px;
        padding: 16px;
      }

      .pagination-controls {
        order: -1;
      }
    }

    @media (max-width: 480px) {
      .inv-header-left {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }

      .inv-header-actions {
        flex-direction: column;

        .inv-btn {
          width: 100%;
        }
      }

      .inv-stats {
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }

      .stat-card {
        padding: 14px;
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;

        .stat-icon {
          width: 40px;
          height: 40px;

          mat-icon {
            font-size: 20px;
            width: 20px;
            height: 20px;
          }
        }

        .stat-content {
          .stat-value {
            font-size: 20px;
          }
        }
      }

      .inv-cards {
        grid-template-columns: 1fr;
      }

      .inv-card {
        .card-body {
          grid-template-columns: repeat(3, 1fr);
          padding: 12px;
        }

        .card-footer {
          flex-direction: column;
          gap: 12px;
          align-items: stretch;

          .status-badge {
            justify-content: center;
          }

          .action-btns {
            justify-content: center;
          }
        }
      }

      .inv-btn .btn-text {
        display: none;
      }

      .inv-btn {
        padding: 12px 16px;
      }
    }
  `]
})
export class InventoryComponent implements OnInit, AfterViewInit, OnDestroy {
  displayedColumns = ['name', 'category', 'stock', 'price', 'value', 'status', 'actions'];
  dataSource = new MatTableDataSource<InventoryItem>([]);
  loading = true;
  private destroy$ = new Subject<void>();
  
  totalProducts = 0;
  totalStock = 0;
  lowStockCount = 0;
  totalValue = 0;

  // Filtering & Pagination
  filterMode: 'all' | 'instock' | 'low' | 'out' = 'all';
  filteredData: InventoryItem[] = [];
  allData: InventoryItem[] = [];
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  paginatedData: InventoryItem[] = [];
  searchTerm = '';
  Math = Math;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadInventory();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadInventory() {
    this.loading = true;
    this.http.get<InventoryItem[]>(`${environment.apiUrl}/products`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.allData = data;
        this.dataSource.data = data;
        this.calculateStats(data);
        this.applyFilters();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Failed to load inventory', 'Close', { duration: 3000 });
      }
    });
  }

  calculateStats(data: InventoryItem[]) {
    this.totalProducts = data.length;
    this.totalStock = data.reduce((sum, item) => sum + item.stock, 0);
    this.lowStockCount = data.filter(item => item.stock <= 10).length;
    this.totalValue = data.reduce((sum, item) => sum + (item.stock * item.price), 0);
  }

  applyFilter(event: Event) {
    this.searchTerm = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.applyFilters();
  }

  clearSearch(input: HTMLInputElement) {
    input.value = '';
    this.searchTerm = '';
    this.applyFilters();
  }

  setFilter(mode: 'all' | 'instock' | 'low' | 'out') {
    this.filterMode = mode;
    this.applyFilters();
  }

  applyFilters() {
    let data = [...this.allData];

    // Search filter
    if (this.searchTerm) {
      data = data.filter(item =>
        item.name?.toLowerCase().includes(this.searchTerm) ||
        item.category?.toLowerCase().includes(this.searchTerm)
      );
    }

    // Status filter
    switch (this.filterMode) {
      case 'instock':
        data = data.filter(item => item.stock > 10);
        break;
      case 'low':
        data = data.filter(item => item.stock <= 10 && item.stock > 0);
        break;
      case 'out':
        data = data.filter(item => item.stock === 0);
        break;
    }

    this.filteredData = data;
    this.totalPages = Math.max(1, Math.ceil(data.length / this.pageSize));
    this.currentPage = Math.min(this.currentPage, this.totalPages);
    this.updatePagination();
  }

  updatePagination() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedData = this.filteredData.slice(start, end);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  onPageSizeChange() {
    this.currentPage = 1;
    this.applyFilters();
  }

  resetFilters(input: HTMLInputElement) {
    input.value = '';
    this.searchTerm = '';
    this.filterMode = 'all';
    this.applyFilters();
  }

  getStockClass(stock: number): string {
    if (stock > 20) return 'stock-good';
    if (stock > 10) return 'stock-medium';
    return 'stock-low';
  }

  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'skin': '🧴', 'hair': '💇', 'nails': '💅', 'makeup': '💄',
      'body': '🧖', 'fragrance': '🌸', 'tools': '✂️', 'accessories': '💎'
    };
    return icons[category?.toLowerCase()] || '📦';
  }

  getCategoryGradient(category: string): string {
    const gradients: { [key: string]: string } = {
      'skin': 'linear-gradient(135deg, #fce7f3, #fbcfe8)',
      'hair': 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
      'nails': 'linear-gradient(135deg, #fecaca, #fca5a5)',
      'makeup': 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
      'body': 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
      'fragrance': 'linear-gradient(135deg, #fef3c7, #fde68a)',
      'tools': 'linear-gradient(135deg, #e5e7eb, #d1d5db)',
      'accessories': 'linear-gradient(135deg, #fce7f3, #f9a8d4)'
    };
    return gradients[category?.toLowerCase()] || 'linear-gradient(135deg, #f3f4f6, #e5e7eb)';
  }

  getCategoryBg(category: string): string {
    const bgs: { [key: string]: string } = {
      'skin': '#fce7f3', 'hair': '#dbeafe', 'nails': '#fecaca', 'makeup': '#ede9fe',
      'body': '#d1fae5', 'fragrance': '#fef3c7', 'tools': '#e5e7eb', 'accessories': '#fce7f3'
    };
    return bgs[category?.toLowerCase()] || '#f3f4f6';
  }

  getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      'skin': '#be185d', 'hair': '#1d4ed8', 'nails': '#dc2626', 'makeup': '#7c3aed',
      'body': '#059669', 'fragrance': '#d97706', 'tools': '#4b5563', 'accessories': '#db2777'
    };
    return colors[category?.toLowerCase()] || '#6b7280';
  }

  showLowStock() {
    this.filterMode = this.filterMode === 'low' ? 'all' : 'low';
    this.applyFilters();
  }

  openAddStockDialog() {
    const dialogRef = this.dialog.open(AddStockDialogComponent, {
      width: '400px',
      data: { products: this.allData }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadInventory();
    });
  }

  addStock(item: InventoryItem) {
    const quantity = prompt('Enter quantity to add:', '10');
    if (quantity && !isNaN(+quantity)) {
      this.http.post(`${environment.apiUrl}/inventory/add-stock`, {
        productId: item._id,
        quantity: +quantity
      }).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.snackBar.open('Stock added successfully', 'Close', { duration: 3000 });
          this.loadInventory();
        },
        error: () => this.snackBar.open('Failed to add stock', 'Close', { duration: 3000 })
      });
    }
  }

  reduceStock(item: InventoryItem) {
    const quantity = prompt('Enter quantity to reduce:', '1');
    if (quantity && !isNaN(+quantity) && +quantity <= item.stock) {
      this.http.put(`${environment.apiUrl}/inventory/update/${item._id}`, {
        stock: item.stock - +quantity
      }).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.snackBar.open('Stock reduced successfully', 'Close', { duration: 3000 });
          this.loadInventory();
        },
        error: () => this.snackBar.open('Failed to reduce stock', 'Close', { duration: 3000 })
      });
    }
  }
}
