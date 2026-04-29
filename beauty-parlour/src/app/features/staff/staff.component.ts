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
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
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
