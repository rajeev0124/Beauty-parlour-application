import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
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
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AddStockDialogComponent } from './add-stock-dialog.component';

interface InventoryItem {
  _id: string;
  name: string;
  category: string;
  stock: number;
  price: number;
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
    MatProgressSpinnerModule, MatBadgeModule
  ],
  template: `
    <div class="inventory-container">
      <div class="header">
        <h1>Inventory Management</h1>
        <div class="header-actions">
          <button mat-raised-button color="warn" (click)="showLowStock()">
            <mat-icon>warning</mat-icon>
            Low Stock ({{ lowStockCount }})
          </button>
          <button mat-raised-button color="primary" (click)="openAddStockDialog()">
            <mat-icon>add</mat-icon>
            Add Stock
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-cards">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon total">
              <mat-icon>inventory_2</mat-icon>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ totalProducts }}</span>
              <span class="stat-label">Total Products</span>
            </div>
          </mat-card-content>
        </mat-card>
        
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon stock">
              <mat-icon>layers</mat-icon>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ totalStock }}</span>
              <span class="stat-label">Total Stock</span>
            </div>
          </mat-card-content>
        </mat-card>
        
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon low">
              <mat-icon>trending_down</mat-icon>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ lowStockCount }}</span>
              <span class="stat-label">Low Stock Items</span>
            </div>
          </mat-card-content>
        </mat-card>
        
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon value">
              <mat-icon>currency_rupee</mat-icon>
            </div>
            <div class="stat-info">
              <span class="stat-value">₹{{ totalValue | number }}</span>
              <span class="stat-label">Inventory Value</span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Search -->
      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Search Products</mat-label>
        <mat-icon matPrefix>search</mat-icon>
        <input matInput (keyup)="applyFilter($event)">
      </mat-form-field>

      <!-- Table -->
      @if (loading) {
        <div class="loading">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {
        <div class="table-container mat-elevation-z2">
          <table mat-table [dataSource]="dataSource" matSort>
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Product Name</th>
              <td mat-cell *matCellDef="let item">{{ item.name }}</td>
            </ng-container>

            <ng-container matColumnDef="category">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Category</th>
              <td mat-cell *matCellDef="let item">
                <mat-chip>{{ item.category }}</mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="stock">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Stock</th>
              <td mat-cell *matCellDef="let item">
                <span [class]="getStockClass(item.stock)">{{ item.stock }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="price">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Price</th>
              <td mat-cell *matCellDef="let item">₹{{ item.price }}</td>
            </ng-container>

            <ng-container matColumnDef="value">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Total Value</th>
              <td mat-cell *matCellDef="let item">₹{{ item.stock * item.price | number }}</td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let item">
                @if (item.stock === 0) {
                  <mat-chip color="warn">Out of Stock</mat-chip>
                } @else if (item.stock <= 10) {
                  <mat-chip color="accent">Low Stock</mat-chip>
                } @else {
                  <mat-chip color="primary">In Stock</mat-chip>
                }
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let item">
                <button mat-icon-button color="primary" (click)="addStock(item)" matTooltip="Add Stock">
                  <mat-icon>add_circle</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="reduceStock(item)" matTooltip="Reduce Stock">
                  <mat-icon>remove_circle</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>

          <mat-paginator [pageSizeOptions]="[10, 25, 50]" showFirstLastButtons></mat-paginator>
        </div>
      }
    </div>
  `,
  styles: [`
    .inventory-container { padding: 24px; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .header h1 { margin: 0; font-size: 24px; }
    .header-actions { display: flex; gap: 12px; }
    
    .stats-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .stat-card { border-radius: 12px; }
    .stat-card mat-card-content { display: flex; align-items: center; gap: 16px; padding: 16px; }
    .stat-icon { width: 56px; height: 56px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .stat-icon.total { background: #e3f2fd; color: #1976d2; }
    .stat-icon.stock { background: #e8f5e9; color: #388e3c; }
    .stat-icon.low { background: #fff3e0; color: #f57c00; }
    .stat-icon.value { background: #f3e5f5; color: #7b1fa2; }
    .stat-icon mat-icon { font-size: 28px; width: 28px; height: 28px; }
    .stat-info { display: flex; flex-direction: column; }
    .stat-value { font-size: 24px; font-weight: 600; }
    .stat-label { font-size: 14px; color: #666; }
    
    .search-field { width: 100%; margin-bottom: 16px; }
    .table-container { border-radius: 8px; overflow: hidden; }
    table { width: 100%; }
    
    .loading { display: flex; justify-content: center; padding: 48px; }
    
    .stock-high { color: #388e3c; font-weight: 600; }
    .stock-medium { color: #f57c00; font-weight: 600; }
    .stock-low { color: #d32f2f; font-weight: 600; }
    
    @media (max-width: 768px) {
      .stats-cards { grid-template-columns: repeat(2, 1fr); }
      .header { flex-direction: column; gap: 16px; align-items: flex-start; }
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
        this.dataSource.data = data;
        this.calculateStats(data);
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
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  getStockClass(stock: number): string {
    if (stock > 20) return 'stock-high';
    if (stock > 10) return 'stock-medium';
    return 'stock-low';
  }

  showLowStock() {
    this.dataSource.filter = '';
    this.dataSource.data = this.dataSource.data.filter(item => item.stock <= 10);
  }

  openAddStockDialog() {
    const dialogRef = this.dialog.open(AddStockDialogComponent, {
      width: '400px',
      data: { products: this.dataSource.data }
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
