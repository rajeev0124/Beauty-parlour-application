import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CurrencyPipe, TitleCasePipe, DecimalPipe } from '@angular/common';
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
    MatSnackBarModule, MatChipsModule, CurrencyPipe, MatProgressBarModule,
    TitleCasePipe, DecimalPipe
  ],
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ServicesComponent implements OnInit, AfterViewInit {
  displayedColumns = ['name', 'category', 'price', 'duration', 'status', 'actions'];
  dataSource = new MatTableDataSource<Service>();
  loading = true;
  categoryFilter = '';

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

  filterByCategory(category: string): void {
    this.categoryFilter = category;
    this.dataSource.filter = category.toLowerCase();
  }

  getActiveCount(): number {
    return this.dataSource.data.filter(s => s.isActive).length;
  }

  getCategoryCount(): number {
    return new Set(this.dataSource.data.map(s => s.category)).size;
  }

  getAveragePrice(): number {
    if (this.dataSource.data.length === 0) return 0;
    const total = this.dataSource.data.reduce((sum, s) => sum + s.price, 0);
    return total / this.dataSource.data.length;
  }

  getCategories(): string[] {
    return [...new Set(this.dataSource.data.map(s => s.category))].sort();
  }

  getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      hair: '💇',
      skin: '✨',
      nails: '💅',
      bridal: '👰',
      makeup: '💄'
    };
    return icons[category?.toLowerCase()] || '🌟';
  }

  getCategoryMatIcon(category: string): string {
    const icons: Record<string, string> = {
      hair: 'content_cut',
      skin: 'face_retouching_natural',
      nails: 'back_hand',
      bridal: 'favorite',
      makeup: 'brush'
    };
    return icons[category?.toLowerCase()] || 'auto_awesome';
  }

  getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      hair: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
      skin: 'linear-gradient(135deg, #ec4899, #db2777)',
      nails: 'linear-gradient(135deg, #f43f5e, #e11d48)',
      bridal: 'linear-gradient(135deg, #f59e0b, #d97706)',
      makeup: 'linear-gradient(135deg, #10b981, #059669)'
    };
    return colors[category?.toLowerCase()] || 'linear-gradient(135deg, #6b7280, #4b5563)';
  }

  getCategoryBg(category: string): string {
    const colors: Record<string, string> = {
      hair: '#ede9fe',
      skin: '#fce7f3',
      nails: '#ffe4e6',
      bridal: '#fef3c7',
      makeup: '#d1fae5'
    };
    return colors[category?.toLowerCase()] || '#f3f4f6';
  }

  getCategoryTextColor(category: string): string {
    const colors: Record<string, string> = {
      hair: '#6d28d9',
      skin: '#be185d',
      nails: '#be123c',
      bridal: '#b45309',
      makeup: '#047857'
    };
    return colors[category?.toLowerCase()] || '#374151';
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
