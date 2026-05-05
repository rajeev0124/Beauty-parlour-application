import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ExpenseDialogComponent } from './expense-dialog.component';

interface Expense {
  _id: string;
  title: string;
  category: string;
  amount: number;
  date: Date;
  description?: string;
  vendor?: string;
  paymentMethod: string;
  addedByName: string;
}

interface CategoryStat {
  _id: string;
  total: number;
  count: number;
}

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatTableModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule,
    MatDialogModule, MatSnackBarModule, MatDatepickerModule, MatNativeDateModule,
    MatMenuModule, MatTooltipModule
  ],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExpensesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Data
  allExpenses: Expense[] = [];
  filteredExpenses: Expense[] = [];
  dataSource = new MatTableDataSource<Expense>([]);
  displayedColumns = ['date', 'title', 'category', 'amount', 'paymentMethod', 'actions'];
  
  // Stats
  stats: { total: number; count: number; byCategory: CategoryStat[] } = { total: 0, count: 0, byCategory: [] };
  thisMonthTotal = 0;
  avgExpense = 0;
  
  // Filters
  searchQuery = '';
  filterCategory = '';
  startDate: Date | null = null;
  endDate: Date | null = null;
  
  // Categories with icons and colors
  categories = [
    { id: 'rent', name: 'Rent', icon: 'home', color: '#ef4444' },
    { id: 'utilities', name: 'Utilities', icon: 'bolt', color: '#f59e0b' },
    { id: 'salary', name: 'Salary', icon: 'people', color: '#10b981' },
    { id: 'supplies', name: 'Supplies', icon: 'inventory_2', color: '#3b82f6' },
    { id: 'equipment', name: 'Equipment', icon: 'precision_manufacturing', color: '#8b5cf6' },
    { id: 'marketing', name: 'Marketing', icon: 'campaign', color: '#ec4899' },
    { id: 'maintenance', name: 'Maintenance', icon: 'build', color: '#6366f1' },
    { id: 'other', name: 'Other', icon: 'more_horiz', color: '#6b7280' }
  ];
  
  // Pagination
  pageSize = 10;
  currentPage = 0;
  pageSizeOptions = [5, 10, 25, 50];
  
  // Loading
  loading = false;

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadExpenses();
    this.loadStats();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadExpenses() {
    this.loading = true;
    let url = `${environment.apiUrl}/expenses?`;
    if (this.filterCategory) url += `category=${this.filterCategory}&`;
    if (this.startDate) url += `startDate=${this.startDate.toISOString()}&`;
    if (this.endDate) url += `endDate=${this.endDate.toISOString()}&`;

    this.http.get<Expense[]>(url).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.allExpenses = data;
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

  loadStats() {
    this.http.get<any>(`${environment.apiUrl}/expenses/stats`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.stats = data;
        this.avgExpense = data.count > 0 ? data.total / data.count : 0;
        
        // Calculate this month total
        const now = new Date();
        const thisMonth = data.monthlyTrend?.find((m: any) => 
          m._id.year === now.getFullYear() && m._id.month === now.getMonth() + 1
        );
        this.thisMonthTotal = thisMonth?.total || 0;
        this.cdr.markForCheck();
      }
    });
  }

  applyFilter() {
    let filtered = [...this.allExpenses];
    
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(e => 
        e.title.toLowerCase().includes(query) ||
        e.category.toLowerCase().includes(query) ||
        e.vendor?.toLowerCase().includes(query) ||
        e.description?.toLowerCase().includes(query)
      );
    }
    
    this.filteredExpenses = filtered;
    this.currentPage = 0;
    this.updateDataSource();
  }

  updateDataSource() {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    this.dataSource.data = this.filteredExpenses.slice(start, end);
    this.cdr.markForCheck();
  }

  setCategory(category: string) {
    this.filterCategory = category;
    this.loadExpenses();
  }

  clearFilters() {
    this.filterCategory = '';
    this.startDate = null;
    this.endDate = null;
    this.searchQuery = '';
    this.loadExpenses();
  }

  getCategoryIcon(category: string): string {
    return this.categories.find(c => c.id === category)?.icon || 'receipt';
  }

  getCategoryColor(category: string): string {
    return this.categories.find(c => c.id === category)?.color || '#6b7280';
  }

  getCategoryName(category: string): string {
    return this.categories.find(c => c.id === category)?.name || category;
  }

  getCategoryPercentage(cat: CategoryStat): number {
    return this.stats.total > 0 ? (cat.total / this.stats.total) * 100 : 0;
  }

  getPaymentIcon(method: string): string {
    const icons: Record<string, string> = {
      cash: 'payments',
      card: 'credit_card',
      upi: 'account_balance',
      bank: 'account_balance',
      cheque: 'receipt'
    };
    return icons[method?.toLowerCase()] || 'payments';
  }

  // Pagination
  get totalPages(): number {
    return Math.ceil(this.filteredExpenses.length / this.pageSize);
  }

  get startIndex(): number {
    return this.currentPage * this.pageSize + 1;
  }

  get endIndex(): number {
    return Math.min((this.currentPage + 1) * this.pageSize, this.filteredExpenses.length);
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.updateDataSource();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.updateDataSource();
    }
  }

  onPageSizeChange() {
    this.currentPage = 0;
    this.updateDataSource();
  }

  openDialog(expense?: Expense) {
    const dialogRef = this.dialog.open(ExpenseDialogComponent, {
      width: '600px',
      maxWidth: '95vw',
      data: expense,
      panelClass: 'expense-dialog-panel'
    });
    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(result => {
      if (result) {
        this.loadExpenses();
        this.loadStats();
      }
    });
  }

  delete(expense: Expense) {
    if (confirm(`Delete expense "${expense.title}"?`)) {
      this.http.delete(`${environment.apiUrl}/expenses/${expense._id}`).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.snackBar.open('Expense deleted successfully', 'Close', { duration: 3000 });
          this.loadExpenses();
          this.loadStats();
        },
        error: () => {
          this.snackBar.open('Failed to delete expense', 'Close', { duration: 3000 });
        }
      });
    }
  }
}
