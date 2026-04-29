import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PackageService, Package } from '../../core/services/package.service';
import { ServiceService } from '../../core/services/service.service';

@Component({
  selector: 'app-packages',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, MatTableModule, MatPaginatorModule, MatSortModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule,
    MatCardModule, MatDialogModule, MatSnackBarModule, MatChipsModule,
    MatSelectModule, MatSlideToggleModule, MatProgressSpinnerModule, MatTooltipModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="packages-container page-shell">
      <div class="header">
        <h1>
          <mat-icon>inventory_2</mat-icon>
          Service Packages
        </h1>
        <button mat-raised-button color="primary" (click)="openDialog()">
          <mat-icon>add</mat-icon>
          Create Package
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="stats-cards">
        <mat-card class="stat-card hover-lift">
          <mat-card-content>
            <div class="stat-icon total"><mat-icon>inventory_2</mat-icon></div>
            <div class="stat-info">
              <span class="stat-value">{{ stats.totalPackages }}</span>
              <span class="stat-label">Total Packages</span>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="stat-card hover-lift">
          <mat-card-content>
            <div class="stat-icon active"><mat-icon>check_circle</mat-icon></div>
            <div class="stat-info">
              <span class="stat-value">{{ stats.activePackages }}</span>
              <span class="stat-label">Active</span>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="stat-card hover-lift">
          <mat-card-content>
            <div class="stat-icon pending"><mat-icon>shopping_bag</mat-icon></div>
            <div class="stat-info">
              <span class="stat-value">{{ stats.totalSold }}</span>
              <span class="stat-label">Total Sold</span>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="stat-card hover-lift">
          <mat-card-content>
            <div class="stat-icon revenue"><mat-icon>currency_rupee</mat-icon></div>
            <div class="stat-info">
              <span class="stat-value">₹{{ stats.revenue | number }}</span>
              <span class="stat-label">Revenue</span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Packages Grid -->
      <div class="packages-grid">
        @if (loading) {
          @for (i of [1,2,3,4]; track i) {
            <mat-card class="package-card skeleton-card">
              <div class="skeleton" style="height: 160px; border-radius: 8px 8px 0 0;"></div>
              <mat-card-content>
                <div class="skeleton" style="width: 80%; height: 24px; margin-bottom: 8px;"></div>
                <div class="skeleton" style="width: 60%; height: 16px;"></div>
              </mat-card-content>
            </mat-card>
          }
        } @else {
          @for (pkg of packages; track pkg._id) {
            <mat-card class="package-card hover-lift" [class.inactive]="!pkg.isActive">
              <div class="package-image" [style.backgroundImage]="'url(' + (pkg.image || 'assets/package-placeholder.jpg') + ')'">
                <div class="discount-badge" *ngIf="pkg.discountPercentage">
                  {{ pkg.discountPercentage }}% OFF
                </div>
                <mat-slide-toggle 
                  class="active-toggle" 
                  [checked]="pkg.isActive" 
                  (change)="toggleActive(pkg)"
                  matTooltip="Toggle active status">
                </mat-slide-toggle>
              </div>
              <mat-card-content>
                <h3>{{ pkg.name }}</h3>
                <p class="description">{{ pkg.description }}</p>
                <div class="price-row">
                  <span class="original-price" *ngIf="pkg.discountPercentage">₹{{ pkg.originalPrice }}</span>
                  <span class="discounted-price">₹{{ pkg.discountedPrice }}</span>
                </div>
                <div class="services-list">
                  <mat-chip-set>
                    @for (s of pkg.services.slice(0, 3); track s.service._id) {
                      <mat-chip>{{ s.service.name }}</mat-chip>
                    }
                    @if (pkg.services && pkg.services.length > 3) {
                      <mat-chip>+{{ pkg.services.length - 3 }} more</mat-chip>
                    }
                  </mat-chip-set>
                </div>
                <div class="meta-info">
                  <span><mat-icon>schedule</mat-icon> Valid: {{ pkg.validityDays }} days</span>
                  <span><mat-icon>repeat</mat-icon> Uses: {{ pkg.maxUsage }}</span>
                </div>
              </mat-card-content>
              <mat-card-actions>
                <button mat-button color="primary" (click)="openDialog(pkg)">
                  <mat-icon>edit</mat-icon> Edit
                </button>
                <button mat-button color="warn" (click)="deletePackage(pkg)">
                  <mat-icon>delete</mat-icon> Delete
                </button>
              </mat-card-actions>
            </mat-card>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .packages-container { padding: 24px; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .header h1 { display: flex; align-items: center; gap: 8px; margin: 0; }
    .stats-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .stat-card mat-card-content { display: flex; align-items: center; gap: 16px; padding: 16px; }
    .stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .stat-icon.total { background: #e3f2fd; color: #1976d2; }
    .stat-icon.active { background: #e8f5e9; color: #388e3c; }
    .stat-icon.pending { background: #fff3e0; color: #f57c00; }
    .stat-icon.revenue { background: #fce4ec; color: #c2185b; }
    .stat-value { font-size: 24px; font-weight: 600; display: block; }
    .stat-label { font-size: 12px; color: #666; }
    .packages-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
    .package-card { overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; }
    .package-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
    .package-card.inactive { opacity: 0.6; }
    .package-image { height: 160px; background-size: cover; background-position: center; position: relative; }
    .discount-badge { position: absolute; top: 12px; left: 12px; background: #e91e63; color: white; padding: 4px 12px; border-radius: 16px; font-weight: 600; font-size: 12px; }
    .active-toggle { position: absolute; top: 12px; right: 12px; }
    mat-card-content h3 { margin: 16px 0 8px; font-size: 18px; }
    .description { color: #666; font-size: 14px; margin-bottom: 12px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .price-row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .original-price { text-decoration: line-through; color: #999; font-size: 14px; }
    .discounted-price { font-size: 24px; font-weight: 600; color: #e91e63; }
    .services-list { margin-bottom: 12px; }
    .meta-info { display: flex; gap: 16px; font-size: 12px; color: #666; }
    .meta-info span { display: flex; align-items: center; gap: 4px; }
    .meta-info mat-icon { font-size: 16px; width: 16px; height: 16px; }
    mat-card-actions { border-top: 1px solid #eee; }
    .skeleton { background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  `]
})
export class PackagesComponent implements OnInit {
  loading = true;
  packages: Package[] = [];
  stats = { totalPackages: 0, activePackages: 0, totalSold: 0, revenue: 0 };

  constructor(
    private packageService: PackageService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.packageService.getAll().subscribe({
      next: (data) => {
        this.packages = data;
        this.stats.totalPackages = data.length;
        this.stats.activePackages = data.filter(p => p.isActive).length;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });

    this.packageService.getStats().subscribe({
      next: (stats) => {
        this.stats = { ...this.stats, ...stats };
        this.cdr.markForCheck();
      }
    });
  }

  openDialog(pkg?: Package): void {
    const name = prompt(pkg ? 'Edit package name:' : 'Enter package name:', pkg?.name || '');
    if (!name) return;

    const price = prompt('Enter price:', pkg?.discountedPrice?.toString() || '');
    if (!price) return;

    const data: Partial<Package> = {
      name,
      discountedPrice: +price,
      originalPrice: pkg?.originalPrice || +price,
      description: prompt('Enter description:', pkg?.description || '') || '',
      validityDays: +(prompt('Validity days:', pkg?.validityDays?.toString() || '30') || 30),
      maxUsage: +(prompt('Max usage:', pkg?.maxUsage?.toString() || '1') || 1),
      isActive: true
    };

    if (pkg) {
      this.packageService.update(pkg._id, data).subscribe({
        next: () => {
          this.snackBar.open('Package updated!', 'Close', { duration: 3000 });
          this.loadData();
        },
        error: () => this.snackBar.open('Failed to update', 'Close', { duration: 3000 })
      });
    } else {
      this.packageService.create(data).subscribe({
        next: () => {
          this.snackBar.open('Package created!', 'Close', { duration: 3000 });
          this.loadData();
        },
        error: () => this.snackBar.open('Failed to create', 'Close', { duration: 3000 })
      });
    }
  }

  toggleActive(pkg: Package): void {
    this.packageService.toggleActive(pkg._id).subscribe({
      next: () => {
        this.snackBar.open(`Package ${pkg.isActive ? 'deactivated' : 'activated'}!`, 'Close', { duration: 3000 });
        this.loadData();
      },
      error: () => this.snackBar.open('Failed to update status', 'Close', { duration: 3000 })
    });
  }

  deletePackage(pkg: Package): void {
    if (confirm(`Delete package "${pkg.name}"?`)) {
      this.packageService.delete(pkg._id).subscribe({
        next: () => {
          this.snackBar.open('Package deleted!', 'Close', { duration: 3000 });
          this.loadData();
        },
        error: () => this.snackBar.open('Failed to delete', 'Close', { duration: 3000 })
      });
    }
  }
}
