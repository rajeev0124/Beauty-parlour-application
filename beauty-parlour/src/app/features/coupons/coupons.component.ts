import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CouponDialogComponent } from './coupon-dialog.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';

interface Coupon {
  _id: string;
  code: string;
  description: string;
  discountType: string;
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  startDate: Date;
  endDate: Date;
  usageCount: number;
  maxUsage?: number;
  isActive: boolean;
}

@Component({
  selector: 'app-coupons',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatTableModule, MatPaginatorModule, MatSortModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule,
    MatCardModule, MatDialogModule, MatSnackBarModule, MatChipsModule, MatSlideToggleModule,
    MatProgressSpinnerModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="coupons-container page-shell">
      <div class="header">
        <h1>Coupons & Offers</h1>
        <button mat-raised-button color="primary" class="ripple-effect btn-press" (click)="openDialog()">
          <mat-icon>add</mat-icon>
          Create Coupon
        </button>
      </div>

      <!-- Stats Cards with Loading State -->
      <div class="stats-cards">
        @if (loading) {
          @for (i of [1,2,3]; track i) {
            <mat-card class="stat-card">
              <mat-card-content>
                <div class="skeleton-stat">
                  <div class="skeleton" style="width: 60px; height: 60px; border-radius: 16px;"></div>
                  <div style="flex: 1;">
                    <div class="skeleton" style="width: 60px; height: 32px; margin-bottom: 8px;"></div>
                    <div class="skeleton" style="width: 100px; height: 14px;"></div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          }
        } @else {
          <mat-card class="stat-card hover-lift stagger-item">
            <mat-card-content>
              <div class="stat-icon total">
                <mat-icon>local_offer</mat-icon>
              </div>
              <div class="stat-info">
                <span class="stat-value animate-fade-in-up">{{ totalCoupons }}</span>
                <span class="stat-label">Total Coupons</span>
              </div>
            </mat-card-content>
          </mat-card>
          
          <mat-card class="stat-card hover-lift stagger-item">
            <mat-card-content>
              <div class="stat-icon active">
                <mat-icon>check_circle</mat-icon>
              </div>
              <div class="stat-info">
                <span class="stat-value animate-fade-in-up">{{ activeCoupons }}</span>
                <span class="stat-label">Active Coupons</span>
              </div>
            </mat-card-content>
          </mat-card>
          
          <mat-card class="stat-card hover-lift stagger-item">
          <mat-card-content>
            <div class="stat-icon used">
              <mat-icon>receipt</mat-icon>
            </div>
            <div class="stat-info">
              <span class="stat-value animate-fade-in-up">{{ totalUsage }}</span>
              <span class="stat-label">Total Redemptions</span>
            </div>
          </mat-card-content>
        </mat-card>
        }
      </div>

      <!-- Search -->
      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Search Coupons</mat-label>
        <mat-icon matPrefix>search</mat-icon>
        <input matInput (keyup)="applyFilter($event)" [disabled]="loading">
      </mat-form-field>

      <!-- Table with Loading & Empty States -->
      <div class="table-container mat-elevation-z2">
        <!-- Loading Skeleton -->
        @if (loading) {
          <div class="skeleton-table-loader">
            <div class="skeleton-row" style="background: linear-gradient(180deg, #F5F3FF 0%, #FAFAFF 100%); padding: 14px 16px;">
              @for (col of [1,2,3,4,5,6]; track col) {
                <div class="skeleton skeleton-cell skeleton-medium"></div>
              }
            </div>
            @for (row of [1,2,3,4,5]; track row) {
              <div class="skeleton-row">
                @for (col of [1,2,3,4,5,6]; track col) {
                  <div class="skeleton skeleton-cell" [style.max-width]="col === 1 ? '100px' : col === 6 ? '120px' : '80px'"></div>
                }
              </div>
            }
          </div>
        } @else if (dataSource.data.length === 0) {
          <!-- Empty State -->
          <div class="empty-state">
            <div class="empty-illustration">
              <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                <circle cx="60" cy="60" r="50" fill="#F5F3FF"/>
                <circle cx="60" cy="60" r="35" fill="#EDE9FE"/>
                <path d="M45 55L55 65L75 45" stroke="#7C3AED" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M40 75H80" stroke="#A855F7" stroke-width="3" stroke-linecap="round"/>
                <circle cx="85" cy="35" r="8" fill="#FEF3C7"/>
                <circle cx="30" cy="45" r="5" fill="#D1FAE5"/>
              </svg>
            </div>
            <h3>No Coupons Yet</h3>
            <p>Create your first coupon to start offering discounts to your customers</p>
            <button mat-raised-button color="primary" class="ripple-effect" (click)="openDialog()">
              <mat-icon>add</mat-icon>
              Create First Coupon
            </button>
          </div>
        } @else {
          <table mat-table [dataSource]="dataSource" matSort>
            <ng-container matColumnDef="code">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Code</th>
              <td mat-cell *matCellDef="let coupon">
                <strong>{{ coupon.code }}</strong>
              </td>
            </ng-container>

            <ng-container matColumnDef="discount">
              <th mat-header-cell *matHeaderCellDef>Discount</th>
              <td mat-cell *matCellDef="let coupon">
                @if (coupon.discountType === 'percentage') {
                  <span class="discount-badge percentage">{{ coupon.discountValue }}% OFF</span>
                } @else {
                  <span class="discount-badge flat">₹{{ coupon.discountValue }} OFF</span>
                }
              </td>
            </ng-container>

            <ng-container matColumnDef="validity">
              <th mat-header-cell *matHeaderCellDef>Validity</th>
              <td mat-cell *matCellDef="let coupon">
                {{ coupon.startDate | date:'shortDate' }} - {{ coupon.endDate | date:'shortDate' }}
              </td>
            </ng-container>

            <ng-container matColumnDef="usage">
              <th mat-header-cell *matHeaderCellDef>Usage</th>
              <td mat-cell *matCellDef="let coupon">
                <span class="usage-badge">{{ coupon.usageCount }}{{ coupon.maxUsage ? '/' + coupon.maxUsage : '' }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let coupon">
                @if (isExpired(coupon)) {
                  <span class="status-pill expired">Expired</span>
                } @else if (coupon.isActive) {
                  <span class="status-pill active">Active</span>
                } @else {
                  <span class="status-pill inactive">Inactive</span>
                }
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let coupon">
                <div class="action-buttons">
                  <mat-slide-toggle 
                    [checked]="coupon.isActive" 
                    (change)="toggleActive(coupon)"
                    [disabled]="isExpired(coupon)">
                  </mat-slide-toggle>
                  <button mat-icon-button class="action-btn edit" (click)="openDialog(coupon)">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button class="action-btn delete" (click)="delete(coupon)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="table-row"></tr>
          </table>
          <mat-paginator [pageSizeOptions]="[10, 25, 50]" showFirstLastButtons></mat-paginator>
        }
      </div>

      <!-- Success Toast Animation -->
      @if (showSuccess) {
        <div class="success-toast animate-scale">
          <div class="success-icon">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <circle cx="12" cy="12" r="11" fill="#059669"/>
              <path d="M7 12l3 3 7-7" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="checkmark"/>
            </svg>
          </div>
          <span>{{ successMessage }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .coupons-container { padding: 24px; position: relative; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .header h1 { 
      margin: 0; 
      font-size: 26px;
      font-weight: 700;
      background: linear-gradient(135deg, #7C3AED 0%, #A855F7 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .stats-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 24px; }
    .stat-card { 
      border-radius: 16px !important; 
      border: 1px solid #E9D5FF !important;
      transition: all 0.3s ease !important;
    }
    .stat-card:hover { 
      transform: translateY(-4px); 
      box-shadow: 0 12px 24px rgba(124, 58, 237, 0.12) !important;
    }
    .stat-card mat-card-content { display: flex; align-items: center; gap: 16px; padding: 20px; }
    .stat-icon { 
      width: 60px; 
      height: 60px; 
      border-radius: 16px; 
      display: flex; 
      align-items: center; 
      justify-content: center;
      transition: transform 0.3s ease;
    }
    .stat-card:hover .stat-icon { transform: scale(1.1); }
    .stat-icon.total { 
      background: linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%); 
      color: #7C3AED; 
    }
    .stat-icon.active { 
      background: linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%); 
      color: #059669; 
    }
    .stat-icon.used { 
      background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); 
      color: #D97706; 
    }
    .stat-icon mat-icon { font-size: 28px; width: 28px; height: 28px; }
    .stat-info { display: flex; flex-direction: column; }
    .stat-value { 
      font-size: 28px; 
      font-weight: 700; 
      background: linear-gradient(135deg, #1E1B4B 0%, #312E81 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .stat-label { font-size: 13px; color: #6366F1; font-weight: 500; }

    /* Skeleton Styles */
    .skeleton-stat { display: flex; align-items: center; gap: 16px; padding: 4px; }
    
    /* Search Field */
    .search-field { width: 100%; margin-bottom: 16px; }
    
    /* Table Container */
    .table-container { 
      border-radius: 16px; 
      overflow: hidden; 
      border: 1px solid #E9D5FF;
      background: white;
    }
    table { width: 100%; }
    .table-row { transition: background 0.2s ease; }
    .table-row:hover { background: linear-gradient(90deg, #F5F3FF 0%, #FAFAFF 100%) !important; }

    /* Empty State */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 24px;
      text-align: center;
    }
    .empty-illustration { margin-bottom: 24px; animation: float 3s ease-in-out infinite; }
    .empty-state h3 { 
      font-size: 18px; 
      font-weight: 600; 
      color: #1E1B4B; 
      margin: 0 0 8px; 
    }
    .empty-state p { 
      font-size: 14px; 
      color: #6366F1; 
      margin: 0 0 24px;
      max-width: 300px;
    }

    /* Discount Badge */
    .discount-badge {
      display: inline-flex;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }
    .discount-badge.percentage {
      background: linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%);
      color: #7C3AED;
    }
    .discount-badge.flat {
      background: linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%);
      color: #059669;
    }

    /* Usage Badge */
    .usage-badge {
      font-variant-numeric: tabular-nums;
      font-weight: 500;
    }

    /* Status Pills */
    .status-pill {
      display: inline-flex;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .status-pill.active {
      background: linear-gradient(135deg, #059669 0%, #34D399 100%);
      color: white;
    }
    .status-pill.inactive {
      background: #F3F4F6;
      color: #6B7280;
    }
    .status-pill.expired {
      background: linear-gradient(135deg, #E11D48 0%, #FB7185 100%);
      color: white;
    }

    /* Action Buttons */
    .action-buttons {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .action-btn {
      width: 32px !important;
      height: 32px !important;
      transition: all 0.2s ease !important;
    }
    .action-btn mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .action-btn.edit:hover { background: #EDE9FE !important; color: #7C3AED !important; }
    .action-btn.delete:hover { background: #FFE4E6 !important; color: #E11D48 !important; }

    /* Success Toast */
    .success-toast {
      position: fixed;
      bottom: 24px;
      right: 24px;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 24px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 12px 24px rgba(5, 150, 105, 0.2);
      border: 1px solid #D1FAE5;
      z-index: 1000;
    }
    .success-icon .checkmark {
      stroke-dasharray: 20;
      stroke-dashoffset: 20;
      animation: draw-check 0.4s ease forwards 0.2s;
    }
    @keyframes draw-check {
      to { stroke-dashoffset: 0; }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    
    @media (max-width: 768px) {
      .stats-cards { grid-template-columns: 1fr; }
      .header { flex-direction: column; gap: 16px; align-items: flex-start; }
    }
  `]
})
export class CouponsComponent implements OnInit, AfterViewInit, OnDestroy {
  displayedColumns = ['code', 'discount', 'validity', 'usage', 'status', 'actions'];
  dataSource = new MatTableDataSource<Coupon>([]);
  totalCoupons = 0;
  activeCoupons = 0;
  totalUsage = 0;
  loading = true;
  showSuccess = false;
  successMessage = '';
  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadCoupons();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCoupons() {
    this.loading = true;
    this.cdr.markForCheck();
    
    this.http.get<Coupon[]>(`${environment.apiUrl}/coupons`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.totalCoupons = data.length;
        this.activeCoupons = data.filter(c => c.isActive && !this.isExpired(c)).length;
        this.totalUsage = data.reduce((sum, c) => sum + c.usageCount, 0);
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.loading = false;
        this.cdr.markForCheck();
        this.snackBar.open(err.error?.message || 'Failed to load coupons', 'Close', { duration: 3000 });
      }
    });
  }

  showSuccessToast(message: string) {
    this.successMessage = message;
    this.showSuccess = true;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.showSuccess = false;
      this.cdr.markForCheck();
    }, 3000);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  isExpired(coupon: Coupon): boolean {
    return new Date(coupon.endDate) < new Date();
  }

  openDialog(coupon?: Coupon) {
    const dialogRef = this.dialog.open(CouponDialogComponent, {
      width: '500px',
      data: coupon
    });
    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(result => {
      if (result) {
        this.loadCoupons();
        this.showSuccessToast(coupon ? 'Coupon updated successfully!' : 'Coupon created successfully!');
      }
    });
  }

  toggleActive(coupon: Coupon) {
    this.http.put(`${environment.apiUrl}/coupons/${coupon._id}`, { isActive: !coupon.isActive }).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.loadCoupons();
        this.showSuccessToast(coupon.isActive ? 'Coupon deactivated' : 'Coupon activated');
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Failed to update coupon status', 'Close', { duration: 3000 });
      }
    });
  }

  delete(coupon: Coupon) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Coupon',
        message: `Are you sure you want to delete coupon "${coupon.code}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'danger'
      }
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(confirmed => {
      if (confirmed) {
        this.http.delete(`${environment.apiUrl}/coupons/${coupon._id}`).pipe(takeUntil(this.destroy$)).subscribe({
          next: () => {
            this.loadCoupons();
            this.showSuccessToast('Coupon deleted successfully!');
          },
          error: (err) => {
            this.snackBar.open(err.error?.message || 'Failed to delete coupon', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }
}
