import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';

interface Review {
  _id: string;
  userName: string;
  serviceName?: string;
  staffName?: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  adminReply?: string;
  createdAt: Date;
}

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatTableModule, MatPaginatorModule, MatSortModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule,
    MatCardModule, MatDialogModule, MatSnackBarModule, MatChipsModule,
    MatProgressSpinnerModule, MatTabsModule, MatMenuModule, MatTooltipModule,
    DatePipe, DecimalPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './reviews.component.html',
  styleUrl: './reviews.component.scss'
})
export class ReviewsComponent implements OnInit, OnDestroy {
  // Data
  allReviews: Review[] = [];
  filteredReviews: Review[] = [];
  paginatedReviews: Review[] = [];
  pendingReviews: Review[] = [];

  // Stats
  stats = { avgRating: 0, totalReviews: 0, approvedCount: 0 };
  pendingCount = 0;
  ratingDistribution = [0, 0, 0, 0, 0]; // 5,4,3,2,1 stars

  // State
  loading = true;
  showSuccess = false;
  successMessage = '';
  searchTerm = '';
  currentFilter: 'all' | 'approved' | 'pending' | '5star' | '4star' | '3star' | 'low' = 'all';
  replyingTo: Review | null = null;
  replyText = '';

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
    this.loadReviews();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadReviews() {
    this.loading = true;
    this.cdr.markForCheck();

    this.http.get<Review[]>(`${environment.apiUrl}/reviews`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.allReviews = data;
        this.calculateStats();
        this.applyFilter();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  calculateStats() {
    const reviews = this.allReviews;
    this.stats.totalReviews = reviews.length;
    this.stats.approvedCount = reviews.filter(r => r.isApproved).length;
    this.pendingCount = reviews.filter(r => !r.isApproved).length;
    this.pendingReviews = reviews.filter(r => !r.isApproved);

    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
      this.stats.avgRating = sum / reviews.length;
    }

    // Calculate rating distribution
    this.ratingDistribution = [0, 0, 0, 0, 0];
    reviews.forEach(r => {
      if (r.rating >= 1 && r.rating <= 5) {
        this.ratingDistribution[5 - r.rating]++;
      }
    });
  }

  getRatingPercent(index: number): number {
    const total = this.stats.totalReviews;
    if (total === 0) return 0;
    return (this.ratingDistribution[index] / total) * 100;
  }

  applyFilter() {
    let filtered = [...this.allReviews];

    // Apply status/rating filter
    switch (this.currentFilter) {
      case 'approved':
        filtered = filtered.filter(r => r.isApproved);
        break;
      case 'pending':
        filtered = filtered.filter(r => !r.isApproved);
        break;
      case '5star':
        filtered = filtered.filter(r => r.rating === 5);
        break;
      case '4star':
        filtered = filtered.filter(r => r.rating === 4);
        break;
      case '3star':
        filtered = filtered.filter(r => r.rating === 3);
        break;
      case 'low':
        filtered = filtered.filter(r => r.rating <= 2);
        break;
    }

    // Apply search
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(r =>
        r.userName.toLowerCase().includes(term) ||
        r.comment.toLowerCase().includes(term) ||
        (r.serviceName && r.serviceName.toLowerCase().includes(term))
      );
    }

    this.filteredReviews = filtered;
    this.currentPage = 1;
    this.updatePagination();
  }

  filterByStatus(status: typeof this.currentFilter) {
    this.currentFilter = status;
    this.applyFilter();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredReviews.length / this.pageSize) || 1;
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedReviews = this.filteredReviews.slice(start, end);
    this.cdr.markForCheck();
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  getAvatarGradient(name: string): string {
    const colors = [
      'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
      'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
      'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
      'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
      'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
      'linear-gradient(135deg, #ef4444 0%, #f87171 100%)'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  }

  getRatingClass(rating: number): string {
    if (rating >= 4) return 'excellent';
    if (rating === 3) return 'good';
    return 'poor';
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

  approve(review: Review) {
    this.http.put(`${environment.apiUrl}/reviews/${review._id}/approve`, {}).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.showSuccessToast('Review approved successfully!');
        this.loadReviews();
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Failed to approve review', 'Close', { duration: 3000 });
      }
    });
  }

  reject(review: Review) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Reject Review',
        message: `Are you sure you want to reject this review from "${review.userName}"?`,
        confirmText: 'Reject',
        cancelText: 'Cancel',
        type: 'danger'
      }
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(confirmed => {
      if (confirmed) {
        this.http.put(`${environment.apiUrl}/reviews/${review._id}/reject`, {}).pipe(takeUntil(this.destroy$)).subscribe({
          next: () => {
            this.showSuccessToast('Review rejected');
            this.loadReviews();
          }
        });
      }
    });
  }

  openReplyDialog(review: Review) {
    this.replyingTo = review;
    this.replyText = review.adminReply || '';
  }

  cancelReply() {
    this.replyingTo = null;
    this.replyText = '';
  }

  submitReply() {
    if (!this.replyingTo || !this.replyText.trim()) return;

    this.http.put(`${environment.apiUrl}/reviews/${this.replyingTo._id}/reply`, { adminReply: this.replyText }).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.showSuccessToast('Reply sent successfully!');
        this.cancelReply();
        this.loadReviews();
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Failed to send reply', 'Close', { duration: 3000 });
      }
    });
  }

  delete(review: Review) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Review',
        message: `Are you sure you want to delete this review from "${review.userName}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'danger'
      }
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(confirmed => {
      if (confirmed) {
        this.http.delete(`${environment.apiUrl}/reviews/${review._id}`).pipe(takeUntil(this.destroy$)).subscribe({
          next: () => {
            this.showSuccessToast('Review deleted successfully!');
            this.loadReviews();
          },
          error: (err) => {
            this.snackBar.open(err.error?.message || 'Failed to delete review', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }
}
