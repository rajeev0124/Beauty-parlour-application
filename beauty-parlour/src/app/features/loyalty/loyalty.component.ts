import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { LoyaltyService, LoyaltyAccount, LoyaltyTransaction, LeaderboardEntry } from '../../core/services/loyalty.service';

@Component({
  selector: 'app-loyalty',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, MatTableModule, MatPaginatorModule, MatSortModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule,
    MatCardModule, MatDialogModule, MatSnackBarModule, MatChipsModule,
    MatSelectModule, MatProgressSpinnerModule, MatTabsModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="loyalty-container page-shell">
      <div class="header">
        <h1>
          <mat-icon>stars</mat-icon>
          Loyalty Program
        </h1>
      </div>

      <!-- Stats Cards -->
      <div class="stats-cards">
        @if (loading) {
          @for (i of [1,2,3,4]; track i) {
            <mat-card class="stat-card">
              <mat-card-content>
                <div class="skeleton" style="width: 60px; height: 40px;"></div>
              </mat-card-content>
            </mat-card>
          }
        } @else {
          <mat-card class="stat-card hover-lift">
            <mat-card-content>
              <div class="stat-icon total"><mat-icon>people</mat-icon></div>
              <div class="stat-info">
                <span class="stat-value">{{ totalMembers }}</span>
                <span class="stat-label">Total Members</span>
              </div>
            </mat-card-content>
          </mat-card>
          <mat-card class="stat-card hover-lift">
            <mat-card-content>
              <div class="stat-icon active"><mat-icon>diamond</mat-icon></div>
              <div class="stat-info">
                <span class="stat-value">{{ totalPoints | number }}</span>
                <span class="stat-label">Points Issued</span>
              </div>
            </mat-card-content>
          </mat-card>
          <mat-card class="stat-card hover-lift">
            <mat-card-content>
              <div class="stat-icon pending"><mat-icon>redeem</mat-icon></div>
              <div class="stat-info">
                <span class="stat-value">{{ redeemedPoints | number }}</span>
                <span class="stat-label">Points Redeemed</span>
              </div>
            </mat-card-content>
          </mat-card>
          <mat-card class="stat-card hover-lift">
            <mat-card-content>
              <div class="stat-icon revenue"><mat-icon>trending_up</mat-icon></div>
              <div class="stat-info">
                <span class="stat-value">₹{{ pointsValue | number }}</span>
                <span class="stat-label">Rewards Value</span>
              </div>
            </mat-card-content>
          </mat-card>
        }
      </div>

      <mat-tab-group class="loyalty-tabs">
        <!-- Members Tab -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>people</mat-icon>
            <span>Members</span>
          </ng-template>
          <div class="tab-content">
            <mat-card>
              <mat-card-content>
                <div class="table-toolbar">
                  <mat-form-field appearance="outline">
                    <mat-label>Search members</mat-label>
                    <input matInput (keyup)="applyFilter($event)" placeholder="Search by name or email">
                    <mat-icon matSuffix>search</mat-icon>
                  </mat-form-field>
                </div>

                <table mat-table [dataSource]="membersDataSource" matSort>
                  <ng-container matColumnDef="user">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Member</th>
                    <td mat-cell *matCellDef="let m">
                      <div class="user-cell">
                        <span class="name">{{ m.user?.name }}</span>
                        <span class="email">{{ m.user?.email }}</span>
                      </div>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="points">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Points</th>
                    <td mat-cell *matCellDef="let m">
                      <span class="points-badge">{{ m.points | number }}</span>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="tier">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Tier</th>
                    <td mat-cell *matCellDef="let m">
                      <span class="tier-badge" [class]="m.tier?.toLowerCase()">{{ m.tier }}</span>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="lifetimePoints">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Lifetime</th>
                    <td mat-cell *matCellDef="let m">{{ m.lifetimePoints | number }}</td>
                  </ng-container>
                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef>Actions</th>
                    <td mat-cell *matCellDef="let m">
                      <button mat-icon-button color="primary" (click)="addBonus(m)" matTooltip="Add Bonus">
                        <mat-icon>add_circle</mat-icon>
                      </button>
                      <button mat-icon-button (click)="viewHistory(m)" matTooltip="View History">
                        <mat-icon>history</mat-icon>
                      </button>
                    </td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="memberColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: memberColumns;"></tr>
                </table>
                <mat-paginator [pageSizeOptions]="[10, 25, 50]" showFirstLastButtons></mat-paginator>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Leaderboard Tab -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>leaderboard</mat-icon>
            <span>Leaderboard</span>
          </ng-template>
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Top Loyal Customers</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="leaderboard">
                  @for (entry of leaderboard; track entry.rank) {
                    <div class="leaderboard-entry" [class.top-3]="entry.rank <= 3">
                      <span class="rank" [class]="'rank-' + entry.rank">
                        @if (entry.rank === 1) { 🥇 }
                        @else if (entry.rank === 2) { 🥈 }
                        @else if (entry.rank === 3) { 🥉 }
                        @else { {{ entry.rank }} }
                      </span>
                      <div class="user-info">
                        <span class="name">{{ entry.user.name }}</span>
                        <span class="tier">{{ entry.tier }}</span>
                      </div>
                      <span class="points">{{ entry.points | number }} pts</span>
                    </div>
                  }
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Transactions Tab -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>receipt_long</mat-icon>
            <span>Transactions</span>
          </ng-template>
          <div class="tab-content">
            <mat-card>
              <mat-card-content>
                <table mat-table [dataSource]="transactionsDataSource" matSort>
                  <ng-container matColumnDef="date">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Date</th>
                    <td mat-cell *matCellDef="let t">{{ t.createdAt | date:'short' }}</td>
                  </ng-container>
                  <ng-container matColumnDef="type">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Type</th>
                    <td mat-cell *matCellDef="let t">
                      <span class="type-badge" [class]="t.type">{{ t.type | titlecase }}</span>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="points">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Points</th>
                    <td mat-cell *matCellDef="let t" [class.positive]="t.type === 'earn'" [class.negative]="t.type === 'redeem'">
                      {{ t.type === 'redeem' ? '-' : '+' }}{{ t.points | number }}
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="description">
                    <th mat-header-cell *matHeaderCellDef>Description</th>
                    <td mat-cell *matCellDef="let t">{{ t.description }}</td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="transactionColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: transactionColumns;"></tr>
                </table>
                <mat-paginator #transactionPaginator [pageSizeOptions]="[10, 25, 50]" showFirstLastButtons></mat-paginator>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .loyalty-container { padding: 24px; }
    .header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
    .header h1 { display: flex; align-items: center; gap: 8px; margin: 0; }
    .stats-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .stat-card { transition: transform 0.2s; }
    .stat-card:hover { transform: translateY(-4px); }
    .stat-card mat-card-content { display: flex; align-items: center; gap: 16px; padding: 16px; }
    .stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .stat-icon.total { background: #e3f2fd; color: #1976d2; }
    .stat-icon.active { background: #e8f5e9; color: #388e3c; }
    .stat-icon.pending { background: #fff3e0; color: #f57c00; }
    .stat-icon.revenue { background: #fce4ec; color: #c2185b; }
    .stat-value { font-size: 24px; font-weight: 600; display: block; }
    .stat-label { font-size: 12px; color: #666; }
    .loyalty-tabs { margin-top: 16px; }
    .tab-content { padding: 16px 0; }
    .table-toolbar { padding: 16px 0; }
    .user-cell { display: flex; flex-direction: column; }
    .user-cell .name { font-weight: 500; }
    .user-cell .email { font-size: 12px; color: #666; }
    .points-badge { background: #e8f5e9; color: #388e3c; padding: 4px 12px; border-radius: 16px; font-weight: 500; }
    .tier-badge { padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 500; }
    .tier-badge.bronze { background: #efebe9; color: #795548; }
    .tier-badge.silver { background: #eceff1; color: #607d8b; }
    .tier-badge.gold { background: #fff8e1; color: #ff8f00; }
    .tier-badge.platinum { background: #ede7f6; color: #7b1fa2; }
    .type-badge { padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 500; }
    .type-badge.earn { background: #e8f5e9; color: #388e3c; }
    .type-badge.redeem { background: #ffebee; color: #c62828; }
    .type-badge.bonus { background: #e3f2fd; color: #1565c0; }
    .positive { color: #388e3c; font-weight: 500; }
    .negative { color: #c62828; font-weight: 500; }
    .leaderboard { display: flex; flex-direction: column; gap: 12px; }
    .leaderboard-entry { display: flex; align-items: center; gap: 16px; padding: 16px; border-radius: 8px; background: #fafafa; }
    .leaderboard-entry.top-3 { background: linear-gradient(135deg, #fff8e1, #fffde7); }
    .rank { font-size: 20px; width: 40px; text-align: center; }
    .user-info { flex: 1; }
    .user-info .name { font-weight: 500; display: block; }
    .user-info .tier { font-size: 12px; color: #666; }
    .points { font-weight: 600; color: #e91e63; }
    table { width: 100%; }
  `]
})
export class LoyaltyComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('transactionPaginator') transactionPaginator!: MatPaginator;

  loading = true;
  totalMembers = 0;
  totalPoints = 0;
  redeemedPoints = 0;
  pointsValue = 0;

  membersDataSource = new MatTableDataSource<LoyaltyAccount>([]);
  transactionsDataSource = new MatTableDataSource<LoyaltyTransaction>([]);
  leaderboard: LeaderboardEntry[] = [];

  memberColumns = ['user', 'points', 'tier', 'lifetimePoints', 'actions'];
  transactionColumns = ['date', 'type', 'points', 'description'];

  constructor(
    private loyaltyService: LoyaltyService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    this.membersDataSource.paginator = this.paginator;
    this.membersDataSource.sort = this.sort;
    this.transactionsDataSource.paginator = this.transactionPaginator;
  }

  loadData(): void {
    this.loading = true;
    
    // Load leaderboard
    this.loyaltyService.getLeaderboard(20).subscribe({
      next: (data) => {
        this.leaderboard = data;
        this.totalMembers = data.length;
        this.totalPoints = data.reduce((sum, e) => sum + e.points, 0);
        this.pointsValue = this.totalPoints * 0.25; // Assuming 1 point = ₹0.25
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });

    // Load transactions
    this.loyaltyService.getHistory().subscribe({
      next: (data) => {
        this.transactionsDataSource.data = data;
        this.redeemedPoints = data.filter(t => t.type === 'redeem').reduce((sum, t) => sum + t.points, 0);
        this.cdr.markForCheck();
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.membersDataSource.filter = filterValue.trim().toLowerCase();
  }

  addBonus(member: LoyaltyAccount): void {
    const points = prompt('Enter bonus points to add:');
    if (points && !isNaN(+points)) {
      const reason = prompt('Enter reason for bonus:') || 'Manual bonus';
      this.loyaltyService.addBonus(member.user._id, +points, reason).subscribe({
        next: () => {
          this.snackBar.open(`Added ${points} bonus points!`, 'Close', { duration: 3000 });
          this.loadData();
        },
        error: () => this.snackBar.open('Failed to add bonus', 'Close', { duration: 3000 })
      });
    }
  }

  viewHistory(member: LoyaltyAccount): void {
    // Could open a dialog with member's transaction history
    this.snackBar.open('View history for ' + member.user.name, 'Close', { duration: 2000 });
  }
}
