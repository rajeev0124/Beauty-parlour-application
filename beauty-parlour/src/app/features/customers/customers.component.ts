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
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { User } from '../../core/models/user.model';
import { Staff } from '../../core/models/staff.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatChipsModule,
    MatSnackBarModule, DatePipe, MatProgressBarModule,
    MatMenuModule, MatTooltipModule
  ],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.scss'
})
export class CustomersComponent implements OnInit, AfterViewInit, OnDestroy {
  displayedColumns = ['name', 'phone', 'assignedStaff', 'status', 'createdAt', 'actions'];
  dataSource = new MatTableDataSource<User>();
  loading = false;
  staffList: Staff[] = [];
  activeFilter: 'all' | 'active' | 'blocked' = 'all';
  filteredData: User[] = [];
  private searchTerm = '';
  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private http: HttpClient, 
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadStaff();
    this.loadCustomers();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadStaff(): void {
    this.http.get<Staff[]>(`${environment.apiUrl}/staff`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (staff) => {
        this.staffList = staff.filter(s => s.status === 'active');
      },
      error: () => this.snackBar.open('Failed to load staff', 'Close', { duration: 3000 })
    });
  }

  loadCustomers(): void {
    this.loading = true;
    this.http.get<User[]>(`${environment.apiUrl}/users`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (users) => {
        this.dataSource.data = users.filter(u => u.role === 'customer');
        this.applyFilters();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.snackBar.open('Failed to load customers', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  applyFilter(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = this.searchTerm;
    this.applyFilters();
  }

  filterCustomers(filter: 'all' | 'active' | 'blocked'): void {
    this.activeFilter = filter;
    this.applyFilters();
  }

  private applyFilters(): void {
    let data = this.dataSource.data;
    
    // Apply search filter
    if (this.searchTerm) {
      data = data.filter(c => 
        c.name?.toLowerCase().includes(this.searchTerm) ||
        c.email?.toLowerCase().includes(this.searchTerm) ||
        c.phone?.toLowerCase().includes(this.searchTerm)
      );
    }
    
    // Apply status filter
    if (this.activeFilter === 'active') {
      data = data.filter(c => c.status === 'active');
    } else if (this.activeFilter === 'blocked') {
      data = data.filter(c => c.status === 'blocked');
    }
    
    this.filteredData = data;
  }

  clearFilters(): void {
    this.activeFilter = 'all';
    this.searchTerm = '';
    this.dataSource.filter = '';
    this.applyFilters();
  }

  getActiveCount(): number {
    return this.dataSource.data.filter(c => c.status === 'active').length;
  }

  getBlockedCount(): number {
    return this.dataSource.data.filter(c => c.status === 'blocked').length;
  }

  getNewThisMonthCount(): number {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return this.dataSource.data.filter(c => {
      const createdAt = new Date(c.createdAt);
      return createdAt >= startOfMonth;
    }).length;
  }

  getAvatarColor(name: string | undefined): string {
    const colors = [
      'linear-gradient(135deg, #3b82f6, #2563eb)',
      'linear-gradient(135deg, #10b981, #059669)',
      'linear-gradient(135deg, #f59e0b, #d97706)',
      'linear-gradient(135deg, #ec4899, #db2777)',
      'linear-gradient(135deg, #7c3aed, #9333ea)',
      'linear-gradient(135deg, #06b6d4, #0891b2)',
      'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    ];
    if (!name) return colors[0];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  }

  toggleStatus(user: User): void {
    const newStatus = user.status === 'active' ? 'blocked' : 'active';
    this.http.put(`${environment.apiUrl}/users/${user._id}`, { status: newStatus }).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.snackBar.open(`Customer ${newStatus}`, 'Close', { duration: 3000 });
        this.loadCustomers();
      },
      error: () => this.snackBar.open('Failed to update status', 'Close', { duration: 3000 })
    });
  }

  assignStaff(user: User, staff: Staff): void {
    this.http.put(`${environment.apiUrl}/users/${user._id}/add-staff/${staff._id}`, {}).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.snackBar.open(`Added ${staff.name} to ${user.name}`, 'Close', { duration: 3000 });
        this.loadCustomers();
      },
      error: () => this.snackBar.open('Failed to assign staff', 'Close', { duration: 3000 })
    });
  }

  removeStaff(user: User, staff: Staff): void {
    this.http.delete(`${environment.apiUrl}/users/${user._id}/remove-staff/${staff._id}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.snackBar.open(`Removed ${staff.name} from ${user.name}`, 'Close', { duration: 3000 });
        this.loadCustomers();
      },
      error: () => this.snackBar.open('Failed to remove staff', 'Close', { duration: 3000 })
    });
  }

  getAvailableStaff(user: User): Staff[] {
    const assignedIds = user.assignedStaff?.map(s => s._id) || [];
    return this.staffList.filter(s => !assignedIds.includes(s._id));
  }
}
