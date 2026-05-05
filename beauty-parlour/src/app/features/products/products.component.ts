import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CurrencyPipe, TitleCasePipe } from '@angular/common';
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
import { Product } from '../../core/models/product.model';
import { ProductService } from '../../core/services/product.service';
import { ProductDialogComponent } from './product-dialog.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatChipsModule,
    MatDialogModule, MatSnackBarModule, CurrencyPipe, MatProgressBarModule, TitleCasePipe
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductsComponent implements OnInit, AfterViewInit {
  displayedColumns = ['name', 'category', 'price', 'stock', 'status', 'actions'];
  dataSource = new MatTableDataSource<Product>();
  loading = true;
  activeFilter = 'all';
  filteredData: Product[] = [];
  private searchTerm = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private productService: ProductService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadProducts(): void {
    this.loading = true;
    this.cdr.markForCheck();
    
    this.productService.getAll().subscribe({
      next: (products) => {
        this.dataSource.data = products;
        this.applyFilters();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.snackBar.open('Failed to load products', 'Close', { duration: 3000 });
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  applyFilter(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = this.searchTerm;
    this.applyFilters();
  }

  filterProducts(category: string): void {
    this.activeFilter = category;
    this.applyFilters();
  }

  private applyFilters(): void {
    let data = this.dataSource.data;
    
    if (this.searchTerm) {
      data = data.filter(p => 
        p.name?.toLowerCase().includes(this.searchTerm) ||
        p.category?.toLowerCase().includes(this.searchTerm)
      );
    }
    
    if (this.activeFilter !== 'all') {
      data = data.filter(p => p.category?.toLowerCase() === this.activeFilter.toLowerCase());
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
    return this.dataSource.data.filter(p => p.isActive).length;
  }

  getLowStockCount(): number {
    return this.dataSource.data.filter(p => p.stock < 10).length;
  }

  getCategoriesCount(): number {
    return new Set(this.dataSource.data.map(p => p.category?.toLowerCase())).size;
  }

  getCategories(): string[] {
    const cats = new Set(this.dataSource.data.map(p => p.category?.toLowerCase()));
    return Array.from(cats).filter(c => c);
  }

  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'skin': '🧴',
      'hair': '💇',
      'nails': '💅',
      'makeup': '💄',
      'body': '🧖',
      'fragrance': '🌸',
      'tools': '✂️',
      'accessories': '💎'
    };
    return icons[category?.toLowerCase()] || '📦';
  }

  getCategoryGradient(category: string): string {
    const gradients: { [key: string]: string } = {
      'skin': 'linear-gradient(135deg, #fce7f3, #fbcfe8)',
      'hair': 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
      'nails': 'linear-gradient(135deg, #fecaca, #fca5a5)',
      'makeup': 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
      'body': 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
      'fragrance': 'linear-gradient(135deg, #fef3c7, #fde68a)',
      'tools': 'linear-gradient(135deg, #e5e7eb, #d1d5db)',
      'accessories': 'linear-gradient(135deg, #fce7f3, #f9a8d4)'
    };
    return gradients[category?.toLowerCase()] || 'linear-gradient(135deg, #f3f4f6, #e5e7eb)';
  }

  getCategoryBg(category: string): string {
    const bgs: { [key: string]: string } = {
      'skin': '#fce7f3',
      'hair': '#dbeafe',
      'nails': '#fecaca',
      'makeup': '#ede9fe',
      'body': '#d1fae5',
      'fragrance': '#fef3c7',
      'tools': '#e5e7eb',
      'accessories': '#fce7f3'
    };
    return bgs[category?.toLowerCase()] || '#f3f4f6';
  }

  getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      'skin': '#be185d',
      'hair': '#1d4ed8',
      'nails': '#dc2626',
      'makeup': '#7c3aed',
      'body': '#059669',
      'fragrance': '#d97706',
      'tools': '#4b5563',
      'accessories': '#db2777'
    };
    return colors[category?.toLowerCase()] || '#6b7280';
  }

  onImageError(event: Event, product: Product): void {
    // Hide the broken image and show category icon instead
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    // Reset product image to show fallback
    product.image = '';
  }

  openDialog(product?: Product): void {
    const dialogRef = this.dialog.open(ProductDialogComponent, {
      width: '500px',
      data: product || null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadProducts();
    });
  }

  deleteProduct(id: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Delete Product',
        message: 'This action cannot be undone. The product will be permanently removed from inventory.',
        confirmText: 'Delete',
        type: 'danger'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.productService.delete(id).subscribe({
          next: () => {
            this.snackBar.open('Product deleted', 'Close', { duration: 3000 });
            this.loadProducts();
          },
          error: () => this.snackBar.open('Failed to delete product', 'Close', { duration: 3000 })
        });
      }
    });
  }

  getStockColor(stock: number): string {
    if (stock === 0) return '#f44336';
    if (stock < 10) return '#ff9800';
    return '#4caf50';
  }
}
