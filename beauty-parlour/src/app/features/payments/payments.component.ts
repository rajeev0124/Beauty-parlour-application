import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CurrencyPipe, DatePipe, SlicePipe, UpperCasePipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Payment } from '../../core/models/payment.model';
import { PaymentService } from '../../core/services/payment.service';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatCardModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatChipsModule, MatSnackBarModule, CurrencyPipe, DatePipe, 
    SlicePipe, UpperCasePipe, MatProgressBarModule, MatTooltipModule, DecimalPipe,
    TitleCasePipe, FormsModule
  ],
  templateUrl: './payments.component.html',
  styleUrl: './payments.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class PaymentsComponent implements OnInit, AfterViewInit {
  displayedColumns = ['transactionId', 'orderId', 'method', 'amount', 'status', 'createdAt'];
  dataSource = new MatTableDataSource<Payment>();
  loading = false;

  // Stats
  totalTransactions = 0;
  completedCount = 0;
  pendingCount = 0;
  totalAmount = 0;

  // Filtering
  filterMode: 'all' | 'completed' | 'pending' | 'failed' | 'refunded' = 'all';
  allData: Payment[] = [];
  filteredData: Payment[] = [];
  searchTerm = '';

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  paginatedData: Payment[] = [];
  Math = Math;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private paymentService: PaymentService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadPayments();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadPayments(): void {
    this.loading = true;
    this.paymentService.getAll().subscribe({
      next: (payments) => {
        this.allData = payments;
        this.dataSource.data = payments;
        this.calculateStats(payments);
        this.applyFilters();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.snackBar.open('Failed to load payments', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  calculateStats(payments: Payment[]): void {
    this.totalTransactions = payments.length;
    this.completedCount = payments.filter(p => p.status === 'completed').length;
    this.pendingCount = payments.filter(p => p.status === 'pending').length;
    this.totalAmount = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + (p.amount || 0), 0);
  }

  applyFilter(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.applyFilters();
  }

  clearSearch(input: HTMLInputElement): void {
    input.value = '';
    this.searchTerm = '';
    this.applyFilters();
  }

  setFilter(mode: 'all' | 'completed' | 'pending' | 'failed' | 'refunded'): void {
    this.filterMode = mode;
    this.applyFilters();
  }

  applyFilters(): void {
    let data = [...this.allData];

    // Search filter
    if (this.searchTerm) {
      data = data.filter(payment =>
        payment.transactionId?.toLowerCase().includes(this.searchTerm) ||
        payment.orderId?.toLowerCase().includes(this.searchTerm) ||
        payment.method?.toLowerCase().includes(this.searchTerm) ||
        payment.status?.toLowerCase().includes(this.searchTerm)
      );
    }

    // Status filter
    if (this.filterMode !== 'all') {
      data = data.filter(payment => payment.status === this.filterMode);
    }

    this.filteredData = data;
    this.totalPages = Math.max(1, Math.ceil(data.length / this.pageSize));
    this.currentPage = Math.min(this.currentPage, this.totalPages);
    this.updatePagination();
  }

  updatePagination(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedData = this.filteredData.slice(start, end);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  resetFilters(input: HTMLInputElement): void {
    input.value = '';
    this.searchTerm = '';
    this.filterMode = 'all';
    this.applyFilters();
  }

  getStatusColor(status: string): string {
    const map: Record<string, string> = {
      pending: 'accent', completed: 'primary', failed: 'warn', refunded: 'warn'
    };
    return map[status] || '';
  }

  getMethodIcon(method: string): string {
    const map: Record<string, string> = {
      cash: 'payments', card: 'credit_card', upi: 'qr_code', online: 'language'
    };
    return map[method?.toLowerCase()] || 'payment';
  }

  getMethodColor(method: string): string {
    const map: Record<string, string> = {
      cash: '#059669',
      card: '#7c3aed',
      upi: '#2563eb',
      online: '#d97706'
    };
    return map[method?.toLowerCase()] || '#6b7280';
  }

  getMethodBg(method: string): string {
    const map: Record<string, string> = {
      cash: '#d1fae5',
      card: '#ede9fe',
      upi: '#dbeafe',
      online: '#fef3c7'
    };
    return map[method?.toLowerCase()] || '#f3f4f6';
  }
}
