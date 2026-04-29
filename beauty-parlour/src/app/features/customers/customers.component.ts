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
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
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
