import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit, ChangeDetectorRef, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
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
import { MatTooltipModule } from '@angular/material/tooltip';
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
    MatProgressSpinnerModule, MatTooltipModule, DatePipe, DecimalPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './coupons.component.html',
  styleUrl: './coupons.component.scss'
})
export class CouponsComponent implements OnInit, OnDestroy {
  // Data
  allCoupons: Coupon[] = [];
  filteredCoupons: Coupon[] = [];
  paginatedCoupons: Coupon[] = [];
  
  // Stats
  totalCoupons = 0;
  activeCoupons = 0;
  expiredCoupons = 0;
  totalUsage = 0;
  
  // State
  loading = true;
  showSuccess = false;
  successMessage = '';
  searchTerm = '';
  currentFilter: 'all' | 'active' | 'inactive' | 'expired' = 'all';
  
  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  Math = Math;
  
  private destroy$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadCoupons();
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
        this.allCoupons = data;
        this.calculateStats();
        this.applyFilter();
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

  calculateStats() {
    this.totalCoupons = this.allCoupons.length;
    this.activeCoupons = this.allCoupons.filter(c => c.isActive && !this.isExpired(c)).length;
    this.expiredCoupons = this.allCoupons.filter(c => this.isExpired(c)).length;
    this.totalUsage = this.allCoupons.reduce((sum, c) => sum + c.usageCount, 0);
  }

  applyFilter() {
    let filtered = [...this.allCoupons];

    // Apply status filter
    if (this.currentFilter === 'active') {
      filtered = filtered.filter(c => c.isActive && !this.isExpired(c));
    } else if (this.currentFilter === 'inactive') {
      filtered = filtered.filter(c => !c.isActive && !this.isExpired(c));
    } else if (this.currentFilter === 'expired') {
      filtered = filtered.filter(c => this.isExpired(c));
    }

    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.code.toLowerCase().includes(term) ||
        (c.description && c.description.toLowerCase().includes(term))
      );
    }

    this.filteredCoupons = filtered;
    this.currentPage = 1;
    this.updatePagination();
  }

  filterByStatus(status: 'all' | 'active' | 'inactive' | 'expired') {
    this.currentFilter = status;
    this.applyFilter();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredCoupons.length / this.pageSize) || 1;
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedCoupons = this.filteredCoupons.slice(start, end);
    this.cdr.markForCheck();
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  isExpired(coupon: Coupon): boolean {
    return new Date(coupon.endDate) < new Date();
  }

  getDiscountClass(coupon: Coupon): string {
    return coupon.discountType === 'percentage' ? 'percentage' : 'flat';
  }

  getCardStatusClass(coupon: Coupon): string {
    if (this.isExpired(coupon)) return 'expired-card';
    if (!coupon.isActive) return 'inactive-card';
    return '';
  }

  getDaysRemaining(coupon: Coupon): number | null {
    if (this.isExpired(coupon)) return null;
    const today = new Date();
    const endDate = new Date(coupon.endDate);
    const diff = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : null;
  }

  getDaysClass(coupon: Coupon): string {
    const days = this.getDaysRemaining(coupon);
    if (days === null) return '';
    if (days <= 3) return 'urgent';
    if (days <= 7) return 'warning';
    return 'safe';
  }

  getUsagePercent(coupon: Coupon): number {
    if (!coupon.maxUsage) return 0;
    return Math.min((coupon.usageCount / coupon.maxUsage) * 100, 100);
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

  openDialog(coupon?: Coupon) {
    const dialogRef = this.dialog.open(CouponDialogComponent, {
      width: '95%',
      maxWidth: '550px',
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
      width: '90%',
      maxWidth: '400px',
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
