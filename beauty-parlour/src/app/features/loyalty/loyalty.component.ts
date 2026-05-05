import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, ViewEncapsulation, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
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
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil } from 'rxjs';
import { LoyaltyService, LoyaltyAccount, LoyaltyTransaction, LeaderboardEntry } from '../../core/services/loyalty.service';

@Component({
  selector: 'app-loyalty',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, MatTableModule, MatPaginatorModule, MatSortModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule,
    MatCardModule, MatDialogModule, MatSnackBarModule, MatChipsModule,
    MatSelectModule, MatProgressSpinnerModule, MatTabsModule, MatTooltipModule,
    DatePipe, DecimalPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './loyalty.component.html',
  styleUrl: './loyalty.component.scss'
})
export class LoyaltyComponent implements OnInit, OnDestroy {
  // Data
  allMembers: LoyaltyAccount[] = [];
  filteredMembers: LoyaltyAccount[] = [];
  paginatedMembers: LoyaltyAccount[] = [];
  allTransactions: LoyaltyTransaction[] = [];
  filteredTransactions: LoyaltyTransaction[] = [];
  paginatedTransactions: LoyaltyTransaction[] = [];
  leaderboard: LeaderboardEntry[] = [];

  // Stats
  totalMembers = 0;
  totalPoints = 0;
  redeemedPoints = 0;
  pointsValue = 0;

  // State
  loading = true;
  showSuccess = false;
  successMessage = '';
  searchTerm = '';
  transactionSearchTerm = '';
  activeTab: 'members' | 'leaderboard' | 'transactions' = 'members';
  currentFilter: 'all' | 'bronze' | 'silver' | 'gold' | 'platinum' = 'all';

  // Pagination - Members
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  // Pagination - Transactions
  txCurrentPage = 1;
  txPageSize = 10;
  txTotalPages = 1;

  Math = Math;
  private destroy$ = new Subject<void>();

  // For legacy compatibility
  membersDataSource = new MatTableDataSource<LoyaltyAccount>([]);
  transactionsDataSource = new MatTableDataSource<LoyaltyTransaction>([]);
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData(): void {
    this.loading = true;
    this.cdr.markForCheck();

    // Load leaderboard
    this.loyaltyService.getLeaderboard(20).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.leaderboard = data;
        this.allMembers = data.map(entry => ({
          _id: entry.user._id,
          user: entry.user,
          points: entry.points,
          tier: entry.tier,
          lifetimePoints: entry.points // Use points as lifetime since API doesn't provide separate
        } as LoyaltyAccount));
        
        this.totalMembers = data.length;
        this.totalPoints = data.reduce((sum, e) => sum + e.points, 0);
        this.pointsValue = this.totalPoints * 0.25;
        
        this.membersDataSource.data = this.allMembers;
        this.applyMemberFilter();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });

    // Load transactions
    this.loyaltyService.getHistory().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.allTransactions = data;
        this.transactionsDataSource.data = data;
        this.redeemedPoints = data.filter(t => t.type === 'redeem').reduce((sum, t) => sum + t.points, 0);
        this.applyTransactionFilter();
        this.cdr.markForCheck();
      }
    });
  }

  setActiveTab(tab: 'members' | 'leaderboard' | 'transactions') {
    this.activeTab = tab;
    this.cdr.markForCheck();
  }

  // Member filtering
  applyMemberFilter(): void {
    let filtered = [...this.allMembers];

    // Apply tier filter
    if (this.currentFilter !== 'all') {
      filtered = filtered.filter(m => m.tier?.toLowerCase() === this.currentFilter);
    }

    // Apply search
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(m =>
        m.user?.name?.toLowerCase().includes(term) ||
        m.user?.email?.toLowerCase().includes(term)
      );
    }

    this.filteredMembers = filtered;
    this.currentPage = 1;
    this.updateMemberPagination();
  }

  filterByTier(tier: typeof this.currentFilter) {
    this.currentFilter = tier;
    this.applyMemberFilter();
  }

  updateMemberPagination() {
    this.totalPages = Math.ceil(this.filteredMembers.length / this.pageSize) || 1;
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedMembers = this.filteredMembers.slice(start, end);
    this.cdr.markForCheck();
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateMemberPagination();
    }
  }

  // Transaction filtering
  applyTransactionFilter(): void {
    let filtered = [...this.allTransactions];

    if (this.transactionSearchTerm) {
      const term = this.transactionSearchTerm.toLowerCase();
      filtered = filtered.filter(t =>
        t.description?.toLowerCase().includes(term) ||
        t.type?.toLowerCase().includes(term)
      );
    }

    this.filteredTransactions = filtered;
    this.txCurrentPage = 1;
    this.updateTransactionPagination();
  }

  updateTransactionPagination() {
    this.txTotalPages = Math.ceil(this.filteredTransactions.length / this.txPageSize) || 1;
    const start = (this.txCurrentPage - 1) * this.txPageSize;
    const end = start + this.txPageSize;
    this.paginatedTransactions = this.filteredTransactions.slice(start, end);
    this.cdr.markForCheck();
  }

  goToTxPage(page: number) {
    if (page >= 1 && page <= this.txTotalPages) {
      this.txCurrentPage = page;
      this.updateTransactionPagination();
    }
  }

  // Helpers
  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  getAvatarGradient(name: string): string {
    const colors = [
      'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
      'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
      'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
      'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
      'linear-gradient(135deg, #ef4444 0%, #f87171 100%)'
    ];
    const index = (name?.charCodeAt(0) || 0) % colors.length;
    return colors[index];
  }

  getTierIcon(tier: string): string {
    switch (tier?.toLowerCase()) {
      case 'platinum': return 'workspace_premium';
      case 'gold': return 'emoji_events';
      case 'silver': return 'military_tech';
      default: return 'shield';
    }
  }

  getTierClass(tier: string): string {
    return tier?.toLowerCase() || 'bronze';
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

  // Legacy filter method
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchTerm = filterValue;
    this.applyMemberFilter();
  }

  addBonus(member: LoyaltyAccount): void {
    const points = prompt('Enter bonus points to add:');
    if (points && !isNaN(+points)) {
      const reason = prompt('Enter reason for bonus:') || 'Manual bonus';
      this.loyaltyService.addBonus(member.user._id, +points, reason).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.showSuccessToast(`Added ${points} bonus points to ${member.user.name}!`);
          this.loadData();
        },
        error: () => this.snackBar.open('Failed to add bonus', 'Close', { duration: 3000 })
      });
    }
  }

  viewHistory(member: LoyaltyAccount): void {
    this.snackBar.open('Viewing history for ' + member.user?.name, 'Close', { duration: 2000 });
  }
}
