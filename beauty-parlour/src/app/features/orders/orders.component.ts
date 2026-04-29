import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
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
import { CurrencyPipe, DatePipe, SlicePipe } from '@angular/common';
import { Order } from '../../core/models/order.model';
import { OrderService } from '../../core/services/order.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatChipsModule,
    MatSnackBarModule, CurrencyPipe, DatePipe, SlicePipe, MatProgressBarModule
  ],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss'
})
export class OrdersComponent implements OnInit, AfterViewInit, OnDestroy {
  displayedColumns = ['orderId', 'userName', 'totalPrice', 'status', 'createdAt', 'actions'];
  dataSource = new MatTableDataSource<Order>();
  loading = false;
  private destroy$ = new Subject<void>();

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
        this.dataSource.data = orders;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.snackBar.open('Failed to load orders', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
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
}
