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
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { HttpClient } from '@angular/common/http';
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

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatTableModule, MatPaginatorModule, MatSortModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule,
    MatCardModule, MatDialogModule, MatSnackBarModule, MatChipsModule,
    MatSelectModule, MatDatepickerModule, MatNativeDateModule
  ],
  template: `
    <div class="expenses-container">
      <div class="header">
        <h1>Expense Tracking</h1>
        <button mat-raised-button color="primary" (click)="openDialog()">
          <mat-icon>add</mat-icon>
          Add Expense
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="stats-cards">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon total">
              <mat-icon>account_balance_wallet</mat-icon>
            </div>
            <div class="stat-info">
              <span class="stat-value">₹{{ stats.total | number }}</span>
              <span class="stat-label">Total Expenses</span>
            </div>
          </mat-card-content>
        </mat-card>
        
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon month">
              <mat-icon>calendar_month</mat-icon>
            </div>
            <div class="stat-info">
              <span class="stat-value">₹{{ thisMonthTotal | number }}</span>
              <span class="stat-label">This Month</span>
            </div>
          </mat-card-content>
        </mat-card>
        
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon count">
              <mat-icon>receipt_long</mat-icon>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ stats.count }}</span>
              <span class="stat-label">Total Entries</span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Category Breakdown -->
      <mat-card class="category-card">
        <mat-card-header>
          <mat-card-title>Expenses by Category</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="category-list">
            @for (cat of stats.byCategory; track cat._id) {
              <div class="category-item">
                <div class="category-info">
                  <mat-icon>{{ getCategoryIcon(cat._id) }}</mat-icon>
                  <span>{{ cat._id | titlecase }}</span>
                </div>
                <div class="category-amount">₹{{ cat.total | number }}</div>
              </div>
            }
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Filters -->
      <div class="filters">
        <mat-form-field appearance="outline">
          <mat-label>Category</mat-label>
          <mat-select [(ngModel)]="filterCategory" (selectionChange)="loadExpenses()">
            <mat-option value="">All</mat-option>
            <mat-option value="rent">Rent</mat-option>
            <mat-option value="utilities">Utilities</mat-option>
            <mat-option value="salary">Salary</mat-option>
            <mat-option value="supplies">Supplies</mat-option>
            <mat-option value="equipment">Equipment</mat-option>
            <mat-option value="marketing">Marketing</mat-option>
            <mat-option value="maintenance">Maintenance</mat-option>
            <mat-option value="other">Other</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Start Date</mat-label>
          <input matInput [matDatepicker]="startPicker" [(ngModel)]="startDate" (dateChange)="loadExpenses()">
          <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
          <mat-datepicker #startPicker></mat-datepicker>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>End Date</mat-label>
          <input matInput [matDatepicker]="endPicker" [(ngModel)]="endDate" (dateChange)="loadExpenses()">
          <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
          <mat-datepicker #endPicker></mat-datepicker>
        </mat-form-field>
      </div>

      <!-- Table -->
      <div class="table-container mat-elevation-z2">
        <table mat-table [dataSource]="dataSource" matSort>
          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Date</th>
            <td mat-cell *matCellDef="let expense">{{ expense.date | date:'mediumDate' }}</td>
          </ng-container>

          <ng-container matColumnDef="title">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Title</th>
            <td mat-cell *matCellDef="let expense">{{ expense.title }}</td>
          </ng-container>

          <ng-container matColumnDef="category">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Category</th>
            <td mat-cell *matCellDef="let expense">
              <mat-chip>{{ expense.category | titlecase }}</mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="amount">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Amount</th>
            <td mat-cell *matCellDef="let expense" class="amount">₹{{ expense.amount | number }}</td>
          </ng-container>

          <ng-container matColumnDef="paymentMethod">
            <th mat-header-cell *matHeaderCellDef>Payment</th>
            <td mat-cell *matCellDef="let expense">{{ expense.paymentMethod | titlecase }}</td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let expense">
              <button mat-icon-button color="primary" (click)="openDialog(expense)">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="delete(expense)">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
        <mat-paginator [pageSizeOptions]="[10, 25, 50]" showFirstLastButtons></mat-paginator>
      </div>
    </div>
  `,
  styles: [`
    .expenses-container { padding: 24px; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .header h1 { margin: 0; }
    
    .stats-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
    .stat-card mat-card-content { display: flex; align-items: center; gap: 16px; padding: 16px; }
    .stat-icon { width: 56px; height: 56px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .stat-icon.total { background: #ffebee; color: #c62828; }
    .stat-icon.month { background: #e3f2fd; color: #1976d2; }
    .stat-icon.count { background: #e8f5e9; color: #388e3c; }
    .stat-icon mat-icon { font-size: 28px; width: 28px; height: 28px; }
    .stat-info { display: flex; flex-direction: column; }
    .stat-value { font-size: 24px; font-weight: 600; }
    .stat-label { font-size: 14px; color: #666; }
    
    .category-card { margin-bottom: 24px; }
    .category-list { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
    .category-item { display: flex; justify-content: space-between; padding: 12px; background: #f5f5f5; border-radius: 8px; }
    .category-info { display: flex; align-items: center; gap: 8px; }
    .category-amount { font-weight: 600; }
    
    .filters { display: flex; gap: 16px; margin-bottom: 16px; }
    .filters mat-form-field { flex: 1; }
    
    .table-container { border-radius: 8px; overflow: hidden; }
    table { width: 100%; }
    .amount { font-weight: 600; color: #c62828; }
    
    @media (max-width: 768px) {
      .stats-cards { grid-template-columns: 1fr; }
      .category-list { grid-template-columns: repeat(2, 1fr); }
      .filters { flex-direction: column; }
      .header { flex-direction: column; gap: 16px; align-items: flex-start; }
    }
  `]
})
export class ExpensesComponent implements OnInit, AfterViewInit {
  displayedColumns = ['date', 'title', 'category', 'amount', 'paymentMethod', 'actions'];
  dataSource = new MatTableDataSource<Expense>([]);
  stats: any = { total: 0, count: 0, byCategory: [] };
  thisMonthTotal = 0;
  
  filterCategory = '';
  startDate: Date | null = null;
  endDate: Date | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

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

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadExpenses() {
    let url = `${environment.apiUrl}/expenses?`;
    if (this.filterCategory) url += `category=${this.filterCategory}&`;
    if (this.startDate) url += `startDate=${this.startDate.toISOString()}&`;
    if (this.endDate) url += `endDate=${this.endDate.toISOString()}&`;

    this.http.get<Expense[]>(url).subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.cdr.detectChanges();
      }
    });
  }

  loadStats() {
    this.http.get<any>(`${environment.apiUrl}/expenses/stats`).subscribe({
      next: (data) => {
        this.stats = data;
        // Calculate this month total
        const now = new Date();
        const thisMonth = data.monthlyTrend?.find((m: any) => 
          m._id.year === now.getFullYear() && m._id.month === now.getMonth() + 1
        );
        this.thisMonthTotal = thisMonth?.total || 0;
      }
    });
  }

  getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      rent: 'home',
      utilities: 'bolt',
      salary: 'people',
      supplies: 'inventory_2',
      equipment: 'precision_manufacturing',
      marketing: 'campaign',
      maintenance: 'build',
      other: 'more_horiz'
    };
    return icons[category] || 'receipt';
  }

  openDialog(expense?: Expense) {
    const dialogRef = this.dialog.open(ExpenseDialogComponent, {
      width: '500px',
      data: expense
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadExpenses();
        this.loadStats();
      }
    });
  }

  delete(expense: Expense) {
    if (confirm('Delete this expense?')) {
      this.http.delete(`${environment.apiUrl}/expenses/${expense._id}`).subscribe({
        next: () => {
          this.snackBar.open('Expense deleted', 'Close', { duration: 3000 });
          this.loadExpenses();
          this.loadStats();
        }
      });
    }
  }
}
