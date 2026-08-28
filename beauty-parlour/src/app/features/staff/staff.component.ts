import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Staff } from '../../core/models/staff.model';
import { StaffService } from '../../core/services/staff.service';
import { StaffDialogComponent } from './staff-dialog.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';

@Component({
  selector: 'app-staff',
  standalone: true,
  imports: [
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatChipsModule,
    MatDialogModule, MatSnackBarModule, MatProgressBarModule
  ],
  templateUrl: './staff.component.html',
  styleUrl: './staff.component.scss'
})
export class StaffComponent implements OnInit, AfterViewInit {
  displayedColumns = ['name', 'specialization', 'role', 'phone', 'availability', 'status', 'actions'];
  dataSource = new MatTableDataSource<Staff>();
  loading = false;
  activeFilter: 'all' | 'available' | 'unavailable' = 'all';
  filteredData: Staff[] = [];
  currentPage = 0;
  pageSize = 10;
  private searchTerm = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private staffService: StaffService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadStaff();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadStaff(): void {
    this.loading = true;
    this.staffService.getAll().subscribe({
      next: (staff) => {
        this.dataSource.data = staff;
        this.applyFilters();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.snackBar.open('Failed to load staff', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  applyFilter(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = this.searchTerm;
    this.applyFilters();
  }

  filterStaff(filter: 'all' | 'available' | 'unavailable'): void {
    this.activeFilter = filter;
    this.applyFilters();
  }

  get paginatedData(): Staff[] {
    const startIndex = this.currentPage * this.pageSize;
    return this.filteredData.slice(startIndex, startIndex + this.pageSize);
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  private applyFilters(): void {
    let data = this.dataSource.data;
    
    // Apply search filter
    if (this.searchTerm) {
      data = data.filter(s => 
        s.name?.toLowerCase().includes(this.searchTerm) ||
        s.role?.toLowerCase().includes(this.searchTerm) ||
        s.specialization?.toLowerCase().includes(this.searchTerm)
      );
    }
    
    // Apply availability filter
    if (this.activeFilter === 'available') {
      data = data.filter(s => s.availability);
    } else if (this.activeFilter === 'unavailable') {
      data = data.filter(s => !s.availability);
    }
    
    this.filteredData = data;
    this.currentPage = 0;
  }

  clearFilters(): void {
    this.activeFilter = 'all';
    this.searchTerm = '';
    this.dataSource.filter = '';
    this.applyFilters();
  }

  getActiveCount(): number {
    return this.dataSource.data.filter(s => s.status === 'active').length;
  }

  getAvailableCount(): number {
    return this.dataSource.data.filter(s => s.availability).length;
  }

  getRolesCount(): number {
    const roles = new Set(this.dataSource.data.map(s => s.role));
    return roles.size;
  }

  getAvatarColor(name: string | undefined): string {
    const colors = [
      'linear-gradient(135deg, #7c3aed, #9333ea)',
      'linear-gradient(135deg, #3b82f6, #2563eb)',
      'linear-gradient(135deg, #10b981, #059669)',
      'linear-gradient(135deg, #f59e0b, #d97706)',
      'linear-gradient(135deg, #ec4899, #db2777)',
      'linear-gradient(135deg, #06b6d4, #0891b2)',
      'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    ];
    if (!name) return colors[0];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  }

  getRoleColor(role: string | undefined): { bg: string; text: string } {
    const roleColors: { [key: string]: { bg: string; text: string } } = {
      'manager': { bg: '#ede9fe', text: '#7c3aed' },
      'senior stylist': { bg: '#dbeafe', text: '#2563eb' },
      'junior stylist': { bg: '#d1fae5', text: '#059669' },
      'skin specialist': { bg: '#fce7f3', text: '#db2777' },
      'nail technician': { bg: '#fee2e2', text: '#dc2626' },
      'bridal expert': { bg: '#fce7f3', text: '#be185d' },
    };
    const lowerRole = (role || '').toLowerCase();
    return roleColors[lowerRole] || { bg: '#f3f4f6', text: '#6b7280' };
  }

  openDialog(staff?: Staff): void {
    const dialogRef = this.dialog.open(StaffDialogComponent, {
      width: '500px',
      data: staff || null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadStaff();
    });
  }

  deleteStaff(id: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Delete Staff Member',
        message: 'This action cannot be undone. The staff member will be permanently removed.',
        confirmText: 'Delete',
        type: 'danger'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.staffService.delete(id).subscribe({
          next: () => {
            this.snackBar.open('Staff deleted', 'Close', { duration: 3000 });
            this.loadStaff();
          },
          error: () => this.snackBar.open('Failed to delete staff', 'Close', { duration: 3000 })
        });
      }
    });
  }
}
