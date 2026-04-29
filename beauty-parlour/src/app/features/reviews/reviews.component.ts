import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
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
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

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
    MatProgressSpinnerModule, MatTabsModule, MatMenuModule
  ],
  template: `
    <div class="reviews-container">
      <div class="header">
        <h1>Reviews & Ratings</h1>
      </div>

      <!-- Stats Cards -->
      <div class="stats-cards">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon rating">
              <mat-icon>star</mat-icon>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ stats.avgRating | number:'1.1-1' }}</span>
              <span class="stat-label">Average Rating</span>
            </div>
          </mat-card-content>
        </mat-card>
        
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon total">
              <mat-icon>rate_review</mat-icon>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ stats.totalReviews }}</span>
              <span class="stat-label">Total Reviews</span>
            </div>
          </mat-card-content>
        </mat-card>
        
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon pending">
              <mat-icon>pending</mat-icon>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ pendingCount }}</span>
              <span class="stat-label">Pending Approval</span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <mat-tab-group>
        <mat-tab label="All Reviews">
          <div class="table-container mat-elevation-z2">
            <table mat-table [dataSource]="dataSource" matSort>
              <ng-container matColumnDef="userName">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Customer</th>
                <td mat-cell *matCellDef="let review">{{ review.userName }}</td>
              </ng-container>

              <ng-container matColumnDef="rating">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Rating</th>
                <td mat-cell *matCellDef="let review">
                  <div class="stars">
                    @for (star of [1,2,3,4,5]; track star) {
                      <mat-icon [class.filled]="star <= review.rating">star</mat-icon>
                    }
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="comment">
                <th mat-header-cell *matHeaderCellDef>Comment</th>
                <td mat-cell *matCellDef="let review">{{ review.comment | slice:0:50 }}...</td>
              </ng-container>

              <ng-container matColumnDef="serviceName">
                <th mat-header-cell *matHeaderCellDef>Service</th>
                <td mat-cell *matCellDef="let review">{{ review.serviceName || '-' }}</td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let review">
                  @if (review.isApproved) {
                    <mat-chip color="primary">Approved</mat-chip>
                  } @else {
                    <mat-chip color="warn">Pending</mat-chip>
                  }
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let review">
                  <button mat-icon-button [matMenuTriggerFor]="menu">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #menu="matMenu">
                    @if (!review.isApproved) {
                      <button mat-menu-item (click)="approve(review)">
                        <mat-icon>check</mat-icon> Approve
                      </button>
                    }
                    <button mat-menu-item (click)="reply(review)">
                      <mat-icon>reply</mat-icon> Reply
                    </button>
                    <button mat-menu-item (click)="delete(review)">
                      <mat-icon>delete</mat-icon> Delete
                    </button>
                  </mat-menu>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
            <mat-paginator [pageSizeOptions]="[10, 25, 50]" showFirstLastButtons></mat-paginator>
          </div>
        </mat-tab>

        <mat-tab label="Pending ({{ pendingCount }})">
          <div class="reviews-list">
            @for (review of pendingReviews; track review._id) {
              <mat-card class="review-card">
                <mat-card-header>
                  <div class="review-header">
                    <span class="reviewer">{{ review.userName }}</span>
                    <div class="stars">
                      @for (star of [1,2,3,4,5]; track star) {
                        <mat-icon [class.filled]="star <= review.rating">star</mat-icon>
                      }
                    </div>
                  </div>
                </mat-card-header>
                <mat-card-content>
                  <p>{{ review.comment }}</p>
                  @if (review.serviceName) {
                    <small>Service: {{ review.serviceName }}</small>
                  }
                </mat-card-content>
                <mat-card-actions>
                  <button mat-raised-button color="primary" (click)="approve(review)">
                    <mat-icon>check</mat-icon> Approve
                  </button>
                  <button mat-raised-button color="warn" (click)="reject(review)">
                    <mat-icon>close</mat-icon> Reject
                  </button>
                </mat-card-actions>
              </mat-card>
            }
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .reviews-container { padding: 24px; }
    .header { margin-bottom: 24px; }
    .header h1 { margin: 0; }
    
    .stats-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
    .stat-card mat-card-content { display: flex; align-items: center; gap: 16px; padding: 16px; }
    .stat-icon { width: 56px; height: 56px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .stat-icon.rating { background: #fff3e0; color: #f57c00; }
    .stat-icon.total { background: #e3f2fd; color: #1976d2; }
    .stat-icon.pending { background: #fce4ec; color: #c2185b; }
    .stat-icon mat-icon { font-size: 28px; width: 28px; height: 28px; }
    .stat-info { display: flex; flex-direction: column; }
    .stat-value { font-size: 24px; font-weight: 600; }
    .stat-label { font-size: 14px; color: #666; }
    
    .table-container { margin-top: 16px; border-radius: 8px; overflow: hidden; }
    table { width: 100%; }
    
    .stars { display: flex; }
    .stars mat-icon { color: #ddd; font-size: 18px; width: 18px; height: 18px; }
    .stars mat-icon.filled { color: #ffc107; }
    
    .reviews-list { display: grid; gap: 16px; margin-top: 16px; }
    .review-card { border-radius: 12px; }
    .review-header { display: flex; justify-content: space-between; width: 100%; align-items: center; }
    .reviewer { font-weight: 600; }
    
    @media (max-width: 768px) {
      .stats-cards { grid-template-columns: 1fr; }
    }
  `]
})
export class ReviewsComponent implements OnInit, AfterViewInit {
  displayedColumns = ['userName', 'rating', 'comment', 'serviceName', 'status', 'actions'];
  dataSource = new MatTableDataSource<Review>([]);
  pendingReviews: Review[] = [];
  pendingCount = 0;
  stats = { avgRating: 0, totalReviews: 0 };

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadReviews();
    this.loadStats();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadReviews() {
    this.http.get<Review[]>(`${environment.apiUrl}/reviews`).subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.pendingReviews = data.filter(r => !r.isApproved);
        this.pendingCount = this.pendingReviews.length;
        this.cdr.detectChanges();
      }
    });
  }

  loadStats() {
    this.http.get<any>(`${environment.apiUrl}/reviews/stats`).subscribe({
      next: (data) => this.stats = data
    });
  }

  approve(review: Review) {
    this.http.put(`${environment.apiUrl}/reviews/${review._id}/approve`, {}).subscribe({
      next: () => {
        this.snackBar.open('Review approved', 'Close', { duration: 3000 });
        this.loadReviews();
      }
    });
  }

  reject(review: Review) {
    this.http.put(`${environment.apiUrl}/reviews/${review._id}/reject`, {}).subscribe({
      next: () => {
        this.snackBar.open('Review rejected', 'Close', { duration: 3000 });
        this.loadReviews();
      }
    });
  }

  reply(review: Review) {
    const reply = prompt('Enter your reply:');
    if (reply) {
      this.http.put(`${environment.apiUrl}/reviews/${review._id}/reply`, { adminReply: reply }).subscribe({
        next: () => {
          this.snackBar.open('Reply sent', 'Close', { duration: 3000 });
          this.loadReviews();
        }
      });
    }
  }

  delete(review: Review) {
    if (confirm('Delete this review?')) {
      this.http.delete(`${environment.apiUrl}/reviews/${review._id}`).subscribe({
        next: () => {
          this.snackBar.open('Review deleted', 'Close', { duration: 3000 });
          this.loadReviews();
        }
      });
    }
  }
}
