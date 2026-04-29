import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Service } from '../../core/models/service.model';
import { ServiceService } from '../../core/services/service.service';
import { ServiceDialogComponent } from './service-dialog.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatDialogModule,
    MatSnackBarModule, MatChipsModule, CurrencyPipe, MatProgressBarModule
  ],
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ServicesComponent implements OnInit, AfterViewInit {
  displayedColumns = ['name', 'category', 'price', 'duration', 'status', 'actions'];
  dataSource = new MatTableDataSource<Service>();
  loading = true; // Start with loading true

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private serviceService: ServiceService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadServices();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadServices(): void {
    this.loading = true;
    this.cdr.markForCheck();
    
    this.serviceService.getAll().subscribe({
      next: (services) => {
        this.dataSource.data = services;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.snackBar.open('Failed to load services', 'Close', { duration: 3000 });
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  openDialog(service?: Service): void {
    const dialogRef = this.dialog.open(ServiceDialogComponent, {
      width: '500px',
      data: service || null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadServices();
    });
  }

  deleteService(id: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Delete Service',
        message: 'This action cannot be undone. The service will be removed from your catalog.',
        confirmText: 'Delete',
        type: 'danger'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.serviceService.delete(id).subscribe({
          next: () => {
            this.snackBar.open('Service deleted', 'Close', { duration: 3000 });
            this.loadServices();
          },
          error: () => this.snackBar.open('Failed to delete service', 'Close', { duration: 3000 })
        });
      }
    });
  }
}
