import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { CurrencyPipe, DatePipe, SlicePipe, TitleCasePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Order } from '../../core/models/order.model';
import { OrderService } from '../../core/services/order.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatChipsModule,
    MatSnackBarModule, CurrencyPipe, DatePipe, SlicePipe, MatProgressBarModule,
    MatTooltipModule, MatMenuModule, TitleCasePipe, FormsModule, DecimalPipe
  ],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class OrdersComponent implements OnInit, AfterViewInit, OnDestroy {
  displayedColumns = ['orderId', 'userName', 'totalPrice', 'status', 'createdAt', 'actions'];
  dataSource = new MatTableDataSource<Order>();
  loading = false;
  private destroy$ = new Subject<void>();

  // Stats
  totalOrders = 0;
  pendingCount = 0;
  processingCount = 0;
  completedCount = 0;
  totalRevenue = 0;

  // Filtering
  filterMode: 'all' | 'pending' | 'processing' | 'completed' | 'cancelled' = 'all';
  allData: Order[] = [];
  filteredData: Order[] = [];
  searchTerm = '';

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  paginatedData: Order[] = [];
  Math = Math;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private orderService: OrderService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadOrders(): void {
    this.loading = true;
    this.orderService.getAll().pipe(takeUntil(this.destroy$)).subscribe({
      next: (orders) => {
        this.allData = orders;
        this.dataSource.data = orders;
        this.calculateStats(orders);
        this.applyFilters();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.snackBar.open('Failed to load orders', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  calculateStats(orders: Order[]): void {
    this.totalOrders = orders.length;
    this.pendingCount = orders.filter(o => o.status === 'pending').length;
    this.processingCount = orders.filter(o => o.status === 'processing').length;
    this.completedCount = orders.filter(o => o.status === 'completed').length;
    this.totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
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

  setFilter(mode: 'all' | 'pending' | 'processing' | 'completed' | 'cancelled'): void {
    this.filterMode = mode;
    this.applyFilters();
  }

  applyFilters(): void {
    let data = [...this.allData];

    // Search filter
    if (this.searchTerm) {
      data = data.filter(order =>
        order._id?.toLowerCase().includes(this.searchTerm) ||
        order.userName?.toLowerCase().includes(this.searchTerm) ||
        order.status?.toLowerCase().includes(this.searchTerm)
      );
    }

    // Status filter
    if (this.filterMode !== 'all') {
      data = data.filter(order => order.status === this.filterMode);
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

  updateStatus(id: string, status: string): void {
    this.orderService.update(id, { status } as any).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.snackBar.open('Order status updated', 'Close', { duration: 3000 });
        this.loadOrders();
      },
      error: () => this.snackBar.open('Failed to update order', 'Close', { duration: 3000 })
    });
  }

  getStatusColor(status: string): string {
    const map: Record<string, string> = {
      pending: 'accent', processing: 'primary', completed: 'primary', cancelled: 'warn'
    };
    return map[status] || '';
  }

  getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  }

  getAvatarColor(name: string): string {
    const colors = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
    ];
    const index = (name?.charCodeAt(0) || 0) % colors.length;
    return colors[index];
  }
}
