import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, Inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';

// ==================== PACKAGE DIALOG COMPONENT ====================
@Component({
  selector: 'app-package-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatSelectModule, MatSlideToggleModule, MatSnackBarModule
  ],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="premium-package-dialog">
      <div class="ppd-accent"></div>
      
      <div class="ppd-header">
        <div class="ppd-header-content">
          <div class="ppd-icon" [class.edit]="data">
            <mat-icon>{{ data ? 'edit' : 'inventory_2' }}</mat-icon>
          </div>
          <div class="ppd-titles">
            <h2>{{ data ? 'Edit Package' : 'New Package' }}</h2>
            <p>{{ data ? 'Update package details' : 'Create a service bundle for customers' }}</p>
          </div>
        </div>
        <button type="button" class="ppd-close" (click)="dialogRef.close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="ppd-body">
        <form [formGroup]="form" class="ppd-form">
          
          <div class="ppd-card">
            <div class="ppd-card-header">
              <div class="ppd-card-icon name"><mat-icon>badge</mat-icon></div>
              <span class="ppd-card-title">Package Name</span>
              <span class="ppd-required">*</span>
            </div>
            <mat-form-field appearance="outline" class="ppd-field">
              <input matInput formControlName="name" placeholder="e.g. Bridal Glow Package">
            </mat-form-field>
          </div>

          <div class="ppd-card">
            <div class="ppd-card-header">
              <div class="ppd-card-icon category"><mat-icon>category</mat-icon></div>
              <span class="ppd-card-title">Category</span>
            </div>
            <mat-form-field appearance="outline" class="ppd-field">
              <mat-select formControlName="category" placeholder="Select category">
                <mat-option value="standard">Standard</mat-option>
                <mat-option value="premium">Premium</mat-option>
                <mat-option value="bridal">Bridal</mat-option>
                <mat-option value="seasonal">Seasonal</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="ppd-card">
            <div class="ppd-card-header">
              <div class="ppd-card-icon services"><mat-icon>spa</mat-icon></div>
              <span class="ppd-card-title">Included Services</span>
              <span class="ppd-required">*</span>
            </div>
            <mat-form-field appearance="outline" class="ppd-field">
              <mat-select formControlName="selectedServices" multiple placeholder="Select services">
                @for (service of availableServices; track service._id) {
                  <mat-option [value]="service._id">{{ service.name }} - ₹{{ service.price }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>

          <div class="ppd-grid">
            <div class="ppd-card">
              <div class="ppd-card-header">
                <div class="ppd-card-icon price"><mat-icon>sell</mat-icon></div>
                <span class="ppd-card-title">Original Price</span>
              </div>
              <mat-form-field appearance="outline" class="ppd-field">
                <span matPrefix class="ppd-prefix">₹</span>
                <input matInput formControlName="originalPrice" type="number" placeholder="0">
              </mat-form-field>
            </div>
            
            <div class="ppd-card">
              <div class="ppd-card-header">
                <div class="ppd-card-icon discount"><mat-icon>local_offer</mat-icon></div>
                <span class="ppd-card-title">Package Price</span>
                <span class="ppd-required">*</span>
              </div>
              <mat-form-field appearance="outline" class="ppd-field">
                <span matPrefix class="ppd-prefix">₹</span>
                <input matInput formControlName="packagePrice" type="number" placeholder="0">
              </mat-form-field>
            </div>
          </div>

          <div class="ppd-grid">
            <div class="ppd-card">
              <div class="ppd-card-header">
                <div class="ppd-card-icon validity"><mat-icon>event</mat-icon></div>
                <span class="ppd-card-title">Validity</span>
              </div>
              <mat-form-field appearance="outline" class="ppd-field">
                <input matInput formControlName="validityDays" type="number" placeholder="30">
                <span matSuffix class="ppd-suffix">days</span>
              </mat-form-field>
            </div>
            
            <div class="ppd-card">
              <div class="ppd-card-header">
                <div class="ppd-card-icon uses"><mat-icon>replay</mat-icon></div>
                <span class="ppd-card-title">Max Redemptions</span>
              </div>
              <mat-form-field appearance="outline" class="ppd-field">
                <input matInput formControlName="maxRedemptions" type="number" placeholder="1">
                <span matSuffix class="ppd-suffix">times</span>
              </mat-form-field>
            </div>
          </div>

          <div class="ppd-card desc-card">
            <div class="ppd-card-header">
              <div class="ppd-card-icon desc"><mat-icon>description</mat-icon></div>
              <span class="ppd-card-title">Description</span>
              <span class="ppd-optional">(Optional)</span>
            </div>
            <mat-form-field appearance="outline" class="ppd-field textarea">
              <textarea matInput formControlName="description" rows="2" 
                        placeholder="Describe what's included in this package..."></textarea>
            </mat-form-field>
          </div>

          <div class="ppd-toggle-row">
            <div class="ppd-toggle-info">
              <mat-icon [class.active]="form.get('isActive')?.value">{{ form.get('isActive')?.value ? 'visibility' : 'visibility_off' }}</mat-icon>
              <div class="ppd-toggle-text">
                <span class="label">Package Status</span>
                <span class="hint">{{ form.get('isActive')?.value ? 'Available to customers' : 'Hidden from catalog' }}</span>
              </div>
            </div>
            <mat-slide-toggle formControlName="isActive" color="primary"></mat-slide-toggle>
          </div>

        </form>
      </div>

      <div class="ppd-footer">
        <button type="button" class="ppd-btn cancel" (click)="dialogRef.close()">Cancel</button>
        <button type="button" class="ppd-btn submit" (click)="save()" [disabled]="form.invalid || saving">
          @if (saving) {
            <span class="ppd-spinner"></span>
          } @else {
            <mat-icon>{{ data ? 'save' : 'add_circle' }}</mat-icon>
          }
          <span>{{ data ? 'Save Changes' : 'Create Package' }}</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .premium-package-dialog {
      display: flex;
      flex-direction: column;
      width: 100%;
      max-width: 480px;
      background: #fff;
      border-radius: 16px;
      overflow: hidden;
    }

    .ppd-accent {
      height: 4px;
      background: linear-gradient(90deg, #7c3aed, #06b6d4, #7c3aed);
      background-size: 200% 100%;
      animation: shimmer 2s linear infinite;
    }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    .ppd-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding: 16px 20px;
      background: linear-gradient(135deg, #f0f9ff 0%, #fff 100%);
      border-bottom: 1px solid #e0f2fe;
    }

    .ppd-header-content { display: flex; align-items: center; gap: 12px; }

    .ppd-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: linear-gradient(135deg, #7c3aed, #9333ea);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 14px rgba(124, 58, 237, 0.35);
    }

    .ppd-icon.edit {
      background: linear-gradient(135deg, #06b6d4, #0891b2);
      box-shadow: 0 4px 14px rgba(6, 182, 212, 0.35);
    }

    .ppd-icon mat-icon { color: #fff; font-size: 22px; width: 22px; height: 22px; }

    .ppd-titles { display: flex; flex-direction: column; gap: 2px; }
    .ppd-titles h2 { margin: 0; font-size: 17px; font-weight: 700; color: #1f2937; }
    .ppd-titles p { margin: 0; font-size: 12px; color: #6b7280; }

    .ppd-close {
      width: 32px; height: 32px;
      border: none;
      background: rgba(0,0,0,0.04);
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #9ca3af;
      transition: all 0.15s ease;
    }

    .ppd-close:hover { background: rgba(0,0,0,0.08); color: #374151; }
    .ppd-close mat-icon { font-size: 18px; width: 18px; height: 18px; }

    .ppd-body {
      padding: 16px 20px;
      flex: 1;
      overflow-y: auto;
      max-height: 55vh;
    }

    .ppd-form { display: flex; flex-direction: column; gap: 12px; }

    .ppd-card {
      background: #fafafa;
      border: 1px solid #f0f0f0;
      border-radius: 10px;
      padding: 12px;
      transition: all 0.15s ease;
    }

    .ppd-card:focus-within {
      background: #fff;
      border-color: #c4b5fd;
      box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.08);
    }

    .ppd-card-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }

    .ppd-card-icon {
      width: 24px; height: 24px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .ppd-card-icon mat-icon { font-size: 14px; width: 14px; height: 14px; }

    .ppd-card-icon.name { background: #dbeafe; }
    .ppd-card-icon.name mat-icon { color: #2563eb; }
    .ppd-card-icon.category { background: #fce7f3; }
    .ppd-card-icon.category mat-icon { color: #db2777; }
    .ppd-card-icon.services { background: #f3e8ff; }
    .ppd-card-icon.services mat-icon { color: #9333ea; }
    .ppd-card-icon.price { background: #fef3c7; }
    .ppd-card-icon.price mat-icon { color: #d97706; }
    .ppd-card-icon.discount { background: #d1fae5; }
    .ppd-card-icon.discount mat-icon { color: #059669; }
    .ppd-card-icon.validity { background: #e0e7ff; }
    .ppd-card-icon.validity mat-icon { color: #4f46e5; }
    .ppd-card-icon.uses { background: #fce7f3; }
    .ppd-card-icon.uses mat-icon { color: #be185d; }
    .ppd-card-icon.desc { background: #f3f4f6; }
    .ppd-card-icon.desc mat-icon { color: #6b7280; }

    .ppd-card-title { font-size: 11px; font-weight: 600; color: #374151; text-transform: uppercase; letter-spacing: 0.5px; }
    .ppd-required { color: #ef4444; font-size: 12px; font-weight: 600; }
    .ppd-optional { font-size: 10px; color: #9ca3af; margin-left: auto; }

    .ppd-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

    .ppd-field { width: 100%; }
    .ppd-field .mat-mdc-form-field-subscript-wrapper { display: none; }
    .ppd-field .mat-mdc-text-field-wrapper { background: #fff !important; border-radius: 8px !important; }
    .ppd-field .mdc-notched-outline__leading,
    .ppd-field .mdc-notched-outline__notch,
    .ppd-field .mdc-notched-outline__trailing { border-color: #e5e7eb !important; }
    .ppd-field.mat-focused .mdc-notched-outline__leading,
    .ppd-field.mat-focused .mdc-notched-outline__notch,
    .ppd-field.mat-focused .mdc-notched-outline__trailing { border-color: #7c3aed !important; }
    .ppd-field .mat-mdc-form-field-infix { min-height: 40px !important; padding: 8px 0 !important; }
    .ppd-field input, .ppd-field .mat-mdc-select-value, .ppd-field textarea { font-size: 13px !important; }

    .ppd-prefix, .ppd-suffix { font-size: 13px; color: #6b7280; font-weight: 500; }

    .ppd-toggle-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: linear-gradient(135deg, #f0fdf4, #ecfdf5);
      border: 1px solid #bbf7d0;
      border-radius: 10px;
      padding: 12px 14px;
      margin-top: 4px;
    }

    .ppd-toggle-info { display: flex; align-items: center; gap: 10px; }
    .ppd-toggle-info mat-icon { font-size: 22px; width: 22px; height: 22px; color: #9ca3af; transition: color 0.2s ease; }
    .ppd-toggle-info mat-icon.active { color: #22c55e; }
    .ppd-toggle-text { display: flex; flex-direction: column; gap: 1px; }
    .ppd-toggle-text .label { font-size: 13px; font-weight: 600; color: #374151; }
    .ppd-toggle-text .hint { font-size: 11px; color: #6b7280; }

    .ppd-footer {
      display: flex;
      gap: 10px;
      padding: 14px 20px;
      background: #f9fafb;
      border-top: 1px solid #f3f4f6;
    }

    .ppd-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 11px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
      border: none;
    }

    .ppd-btn mat-icon { font-size: 16px; width: 16px; height: 16px; }

    .ppd-btn.cancel { background: #fff; color: #6b7280; border: 1px solid #e5e7eb; }
    .ppd-btn.cancel:hover { background: #f9fafb; border-color: #d1d5db; }

    .ppd-btn.submit {
      background: linear-gradient(135deg, #7c3aed, #9333ea);
      color: #fff;
      box-shadow: 0 2px 8px rgba(124, 58, 237, 0.3);
    }

    .ppd-btn.submit:hover:not(:disabled) { box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4); transform: translateY(-1px); }
    .ppd-btn.submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

    .ppd-spinner {
      width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 480px) {
      .premium-package-dialog { max-width: 100%; border-radius: 12px; }
      .ppd-header { padding: 12px 14px; }
      .ppd-icon { width: 38px; height: 38px; }
      .ppd-titles h2 { font-size: 15px; }
      .ppd-body { padding: 12px 14px; max-height: 50vh; }
      .ppd-card { padding: 10px; }
      .ppd-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
      .ppd-footer { padding: 12px 14px; }
      .ppd-btn { padding: 10px 12px; font-size: 12px; }
    }

    @media (max-width: 360px) {
      .ppd-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class PackageDialogComponent {
  form: FormGroup;
  saving = false;
  availableServices: any[] = [];

  constructor(
    private fb: FormBuilder,
    private packageService: PackageService,
    private serviceService: ServiceService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<PackageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Package | null
  ) {
    this.form = this.fb.group({
      name: [data?.name || '', Validators.required],
      description: [data?.description || ''],
      category: [data?.category || 'standard'],
      selectedServices: [data?.services?.map(s => s.service?._id).filter(Boolean) || [], Validators.required],
      originalPrice: [data?.originalPrice || 0, [Validators.required, Validators.min(0)]],
      packagePrice: [data?.packagePrice || 0, [Validators.required, Validators.min(0)]],
      validityDays: [data?.validityDays || 30],
      maxRedemptions: [data?.maxRedemptions || 1],
      isActive: [data?.isActive ?? true]
    });

    this.loadServices();
  }

  loadServices(): void {
    this.serviceService.getAll().subscribe({
      next: (services) => this.availableServices = services,
      error: (err) => console.error('Failed to load services:', err)
    });
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving = true;

    const values = this.form.value;
    const packageData = {
      name: values.name,
      description: values.description,
      category: values.category,
      services: values.selectedServices.map((id: string) => ({ service: id, quantity: 1 })),
      originalPrice: Number(values.originalPrice),
      packagePrice: Number(values.packagePrice),
      validityDays: Number(values.validityDays),
      maxRedemptions: Number(values.maxRedemptions),
      isActive: values.isActive
    };

    const obs = this.data
      ? this.packageService.update(this.data._id, packageData)
      : this.packageService.create(packageData);

    obs.subscribe({
      next: () => {
        this.snackBar.open(this.data ? 'Package updated!' : 'Package created!', 'Close', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Package error:', err);
        this.saving = false;
        this.snackBar.open('Operation failed', 'Close', { duration: 3000 });
      }
    });
  }
}

// ==================== MAIN PACKAGES COMPONENT ====================
@Component({
  selector: 'app-packages',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
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
              <div class="skeleton" style="height: 140px; border-radius: 8px 8px 0 0;"></div>
              <mat-card-content>
                <div class="skeleton" style="width: 80%; height: 20px; margin-bottom: 8px;"></div>
                <div class="skeleton" style="width: 60%; height: 16px;"></div>
              </mat-card-content>
            </mat-card>
          }
        } @else if (packages.length === 0) {
          <div class="empty-state">
            <mat-icon>inventory_2</mat-icon>
            <h3>No packages yet</h3>
            <p>Create your first service package to offer bundled services at discounted prices.</p>
            <button mat-raised-button color="primary" (click)="openDialog()">
              <mat-icon>add</mat-icon> Create Package
            </button>
          </div>
        } @else {
          @for (pkg of packages; track pkg._id) {
            <mat-card class="package-card hover-lift" [class.inactive]="!pkg.isActive">
              <div class="package-header" [class.premium]="pkg.category === 'premium'" [class.bridal]="pkg.category === 'bridal'">
                <div class="package-category">{{ pkg.category || 'standard' }}</div>
                @if (getDiscount(pkg) > 0) {
                  <div class="discount-badge">{{ getDiscount(pkg) }}% OFF</div>
                }
                <mat-slide-toggle 
                  class="active-toggle" 
                  [checked]="pkg.isActive" 
                  (change)="toggleActive(pkg)"
                  matTooltip="Toggle active">
                </mat-slide-toggle>
              </div>
              <mat-card-content>
                <h3>{{ pkg.name }}</h3>
                <p class="description">{{ pkg.description || 'No description' }}</p>
                <div class="price-row">
                  @if (getDiscount(pkg) > 0) {
                    <span class="original-price">₹{{ pkg.originalPrice }}</span>
                  }
                  <span class="package-price">₹{{ pkg.packagePrice }}</span>
                </div>
                @if (pkg.services && pkg.services.length > 0) {
                  <div class="services-list">
                    <mat-chip-set>
                      @for (s of pkg.services.slice(0, 2); track $index) {
                        <mat-chip>{{ s.service?.name || 'Service' }}</mat-chip>
                      }
                      @if (pkg.services.length > 2) {
                        <mat-chip class="more-chip">+{{ pkg.services.length - 2 }} more</mat-chip>
                      }
                    </mat-chip-set>
                  </div>
                }
                <div class="meta-info">
                  <span><mat-icon>event</mat-icon> {{ pkg.validityDays || 30 }} days</span>
                  <span><mat-icon>replay</mat-icon> {{ pkg.maxRedemptions || 1 }}x use</span>
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
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
    .header h1 { display: flex; align-items: center; gap: 8px; margin: 0; font-size: 24px; }
    .stats-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .stat-card mat-card-content { display: flex; align-items: center; gap: 16px; padding: 16px; }
    .stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .stat-icon.total { background: #e3f2fd; color: #1976d2; }
    .stat-icon.active { background: #e8f5e9; color: #388e3c; }
    .stat-icon.pending { background: #fff3e0; color: #f57c00; }
    .stat-icon.revenue { background: #fce4ec; color: #c2185b; }
    .stat-value { font-size: 24px; font-weight: 600; display: block; }
    .stat-label { font-size: 12px; color: #666; }
    
    .packages-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
    
    .package-card { overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; border-radius: 12px; }
    .package-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
    .package-card.inactive { opacity: 0.6; }
    
    .package-header { 
      height: 80px; 
      background: linear-gradient(135deg, #7c3aed, #9333ea);
      position: relative; 
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding: 12px;
    }
    .package-header.premium { background: linear-gradient(135deg, #f59e0b, #d97706); }
    .package-header.bridal { background: linear-gradient(135deg, #ec4899, #db2777); }
    
    .package-category { 
      font-size: 10px; 
      font-weight: 600; 
      text-transform: uppercase; 
      letter-spacing: 1px;
      color: rgba(255,255,255,0.9);
      background: rgba(0,0,0,0.2);
      padding: 4px 10px;
      border-radius: 12px;
    }
    
    .discount-badge { 
      background: #ef4444;
      color: white; 
      padding: 4px 10px; 
      border-radius: 12px; 
      font-weight: 600; 
      font-size: 11px; 
    }
    
    .active-toggle { position: absolute; bottom: 8px; right: 8px; }
    
    mat-card-content h3 { margin: 16px 0 8px; font-size: 17px; font-weight: 600; }
    .description { color: #666; font-size: 13px; margin-bottom: 12px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 36px; }
    
    .price-row { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
    .original-price { text-decoration: line-through; color: #999; font-size: 14px; }
    .package-price { font-size: 22px; font-weight: 700; color: #7c3aed; }
    
    .services-list { margin-bottom: 12px; }
    .services-list mat-chip { font-size: 11px; min-height: 24px; }
    .more-chip { background: #f3f4f6 !important; color: #6b7280 !important; }
    
    .meta-info { display: flex; gap: 16px; font-size: 12px; color: #666; }
    .meta-info span { display: flex; align-items: center; gap: 4px; }
    .meta-info mat-icon { font-size: 14px; width: 14px; height: 14px; }
    
    mat-card-actions { border-top: 1px solid #f0f0f0; padding: 8px 16px; display: flex; gap: 8px; }
    mat-card-actions button { font-size: 12px; }
    
    .empty-state { 
      grid-column: 1 / -1; 
      text-align: center; 
      padding: 48px 24px; 
      background: #f9fafb;
      border-radius: 12px;
      border: 2px dashed #e5e7eb;
    }
    .empty-state mat-icon { font-size: 64px; width: 64px; height: 64px; color: #d1d5db; }
    .empty-state h3 { margin: 16px 0 8px; color: #374151; }
    .empty-state p { color: #6b7280; margin-bottom: 20px; }
    
    .skeleton { background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

    @media (max-width: 600px) {
      .packages-container { padding: 16px; }
      .header { flex-direction: column; align-items: stretch; }
      .header h1 { font-size: 20px; justify-content: center; }
      .header button { width: 100%; }
      .stats-cards { grid-template-columns: repeat(2, 1fr); gap: 12px; }
      .stat-card mat-card-content { padding: 12px; gap: 10px; }
      .stat-icon { width: 36px; height: 36px; }
      .stat-value { font-size: 18px; }
      .packages-grid { grid-template-columns: 1fr; gap: 16px; }
      .package-header { height: 70px; padding: 10px; }
    }
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

  getDiscount(pkg: Package): number {
    if (!pkg.originalPrice || !pkg.packagePrice || pkg.originalPrice <= pkg.packagePrice) return 0;
    return Math.round(((pkg.originalPrice - pkg.packagePrice) / pkg.originalPrice) * 100);
  }

  openDialog(pkg?: Package): void {
    const dialogRef = this.dialog.open(PackageDialogComponent, {
      width: '100%',
      maxWidth: '500px',
      maxHeight: '90vh',
      panelClass: 'premium-dialog',
      autoFocus: false,
      data: pkg || null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadData();
    });
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
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      panelClass: 'premium-dialog',
      data: {
        title: 'Delete Package',
        message: `Are you sure you want to delete "${pkg.name}"?`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'danger'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.packageService.delete(pkg._id).subscribe({
          next: () => {
            this.snackBar.open('Package deleted!', 'Close', { duration: 3000 });
            this.loadData();
          },
          error: () => this.snackBar.open('Failed to delete', 'Close', { duration: 3000 })
        });
      }
    });
  }
}
