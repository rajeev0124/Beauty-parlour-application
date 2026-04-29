import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
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
import { CurrencyPipe, DatePipe, SlicePipe, UpperCasePipe } from '@angular/common';
import { Payment } from '../../core/models/payment.model';
import { PaymentService } from '../../core/services/payment.service';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatCardModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatChipsModule, MatSnackBarModule, CurrencyPipe, DatePipe, SlicePipe, UpperCasePipe, MatProgressBarModule
  ],
  templateUrl: './payments.component.html',
  styleUrl: './payments.component.scss'
})
export class PaymentsComponent implements OnInit, AfterViewInit {
  displayedColumns = ['transactionId', 'orderId', 'method', 'amount', 'status', 'createdAt'];
  dataSource = new MatTableDataSource<Payment>();
  loading = false;

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
        this.dataSource.data = payments;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.snackBar.open('Failed to load payments', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
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
    return map[method] || 'payment';
  }
}
