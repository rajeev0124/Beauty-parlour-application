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
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatSnackBarModule
  ],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="package-dialog" [class.edit-mode]="data">
      <!-- Decorative shimmer bar -->
      <div class="dialog-accent-bar"></div>

      <!-- Header -->
      <div class="sd-header">
        <div class="sd-header-icon" [class.edit]="data">
          <mat-icon>{{ data ? 'edit_note' : 'inventory_2' }}</mat-icon>
        </div>
        <div class="sd-header-text">
          <h2>{{ data ? 'Edit Package' : 'New Package' }}</h2>
          <p>{{ data ? 'Update package details' : 'Create a service bundle for customers' }}</p>
        </div>
        <button type="button" class="sd-close-btn" (click)="dialogRef.close()" aria-label="Close">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Body -->
      <div class="sd-body">
        <form [formGroup]="form" class="sd-form">
          <!-- Package Name -->
          <div class="sd-field">
            <label class="sd-label">Package Name <span class="required">*</span></label>
            <div class="sd-input-wrapper" [class.error]="form.get('name')?.invalid && form.get('name')?.touched" [class.focused]="nameFocused">
              <mat-icon class="input-icon">badge</mat-icon>
              <input 
                type="text" 
                formControlName="name" 
                placeholder="e.g. Bridal Glow Package"
                (focus)="nameFocused = true"
                (blur)="nameFocused = false">
            </div>
            @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
              <span class="sd-error">
                <mat-icon>error</mat-icon>
                Package name is required
              </span>
            }
          </div>

          <!-- Category -->
          <div class="sd-field">
            <label class="sd-label">Category</label>
            <div class="sd-input-wrapper" [class.focused]="categoryFocused">
              <mat-icon class="input-icon">category</mat-icon>
              <select 
                formControlName="category"
                (focus)="categoryFocused = true"
                (blur)="categoryFocused = false">
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
                <option value="bridal">Bridal</option>
                <option value="seasonal">Seasonal</option>
              </select>
              <mat-icon class="select-arrow">expand_more</mat-icon>
            </div>
          </div>

          <!-- Included Services (Custom Click-Badges Grid) -->
          <div class="sd-field">
            <label class="sd-label">Included Services <span class="required">*</span></label>
            <p class="sd-field-desc">Tap on services to bundle them into this package:</p>
            
            <div class="sd-services-grid">
              @for (service of availableServices; track service._id) {
                <button 
                  type="button" 
                  class="service-badge-btn" 
                  [class.active]="isServiceSelected(service._id)"
                  (click)="toggleService(service._id)">
                  <mat-icon class="badge-icon">{{ getCategoryMatIcon(service.category) }}</mat-icon>
                  <span class="name">{{ service.name }}</span>
                  <span class="price">₹{{ service.price }}</span>
                  @if (isServiceSelected(service._id)) {
                    <mat-icon class="check-mark">check_circle</mat-icon>
                  }
                </button>
              }
            </div>
            @if (form.get('selectedServices')?.hasError('required') && form.get('selectedServices')?.touched) {
              <span class="sd-error">
                <mat-icon>error</mat-icon>
                Please select at least one service
              </span>
            }
          </div>

          <!-- Price & Discount Sum Grid -->
          <div class="sd-row">
            <!-- Original Price (Auto Summed) -->
            <div class="sd-field">
              <div class="sd-label-with-badge">
                <label class="sd-label">Original Price</label>
                <span class="auto-sum-badge">Auto Summed</span>
              </div>
              <div class="sd-input-wrapper readonly" [class.focused]="originalPriceFocused">
                <mat-icon class="input-icon">sell</mat-icon>
                <input 
                  type="number" 
                  formControlName="originalPrice" 
                  placeholder="0"
                  readonly
                  (focus)="originalPriceFocused = true"
                  (blur)="originalPriceFocused = false">
              </div>
            </div>

            <!-- Package Price (Discounted) -->
            <div class="sd-field">
              <label class="sd-label">Package Price <span class="required">*</span></label>
              <div class="sd-input-wrapper" [class.error]="form.get('packagePrice')?.invalid && form.get('packagePrice')?.touched" [class.focused]="packagePriceFocused">
                <mat-icon class="input-icon">local_offer</mat-icon>
                <input 
                  type="number" 
                  formControlName="packagePrice" 
                  placeholder="0"
                  (focus)="packagePriceFocused = true"
                  (blur)="packagePriceFocused = false"
                  (input)="calculateDiscount()">
                @if (discountPercent > 0) {
                  <span class="discount-percent-tag">{{ discountPercent }}% OFF</span>
                }
              </div>
              @if (form.get('packagePrice')?.invalid && form.get('packagePrice')?.touched) {
                <span class="sd-error">
                  <mat-icon>error</mat-icon>
                  Valid package price required
                </span>
              }
            </div>
          </div>

          <!-- Validity & Redemptions -->
          <div class="sd-row">
            <!-- Validity -->
            <div class="sd-field">
              <label class="sd-label">Validity</label>
              <div class="sd-input-wrapper" [class.focused]="validityFocused">
                <mat-icon class="input-icon">event</mat-icon>
                <input 
                  type="number" 
                  formControlName="validityDays" 
                  placeholder="30"
                  (focus)="validityFocused = true"
                  (blur)="validityFocused = false">
                <span class="input-suffix">days</span>
              </div>
            </div>

            <!-- Max Redemptions -->
            <div class="sd-field">
              <label class="sd-label">Max Redemptions</label>
              <div class="sd-input-wrapper" [class.focused]="redemptionsFocused">
                <mat-icon class="input-icon">replay</mat-icon>
                <input 
                  type="number" 
                  formControlName="maxRedemptions" 
                  placeholder="1"
                  (focus)="redemptionsFocused = true"
                  (blur)="redemptionsFocused = false">
                <span class="input-suffix">times</span>
              </div>
            </div>
          </div>

          <!-- Description -->
          <div class="sd-field">
            <label class="sd-label">Description <span class="optional">(Optional)</span></label>
            <div class="sd-input-wrapper textarea" [class.focused]="descriptionFocused">
              <mat-icon class="input-icon">description</mat-icon>
              <textarea 
                formControlName="description" 
                rows="3" 
                placeholder="Describe what's included in this package..."
                (focus)="descriptionFocused = true"
                (blur)="descriptionFocused = false"></textarea>
            </div>
          </div>

          <!-- Active Toggler -->
          <div class="sd-toggle-field">
            <div class="sd-toggle-info">
              <div class="sd-toggle-icon" [class.available]="form.get('isActive')?.value">
                <mat-icon>{{ form.get('isActive')?.value ? 'visibility' : 'visibility_off' }}</mat-icon>
              </div>
              <div class="sd-toggle-text">
                <span class="sd-toggle-label">Package Status</span>
                <span class="sd-toggle-desc">{{ form.get('isActive')?.value ? 'Available to customers' : 'Hidden from catalog' }}</span>
              </div>
            </div>
            <mat-slide-toggle formControlName="isActive" color="primary"></mat-slide-toggle>
          </div>
        </form>
      </div>

      <!-- Footer -->
      <div class="sd-footer">
        <button type="button" class="sd-btn cancel" (click)="dialogRef.close()">
          <mat-icon>close</mat-icon>
          Cancel
        </button>
        <button type="button" class="sd-btn submit" (click)="save()" [disabled]="form.invalid || saving">
          @if (saving) {
            <span class="sd-spinner"></span>
          } @else {
            <mat-icon>{{ data ? 'save' : 'add_circle' }}</mat-icon>
          }
          <span>{{ data ? 'Save Changes' : 'Create Package' }}</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .cdk-overlay-pane:has(.package-dialog) {
      max-width: 95vw !important;
    }

    .mat-mdc-dialog-container:has(.package-dialog) {
      --mdc-dialog-container-shape: 20px;
      padding: 0 !important;
      background: transparent !important;
      box-shadow: none !important;
    }

    .mat-mdc-dialog-container:has(.package-dialog) .mdc-dialog__surface {
      background: transparent !important;
      box-shadow: none !important;
      border-radius: 20px !important;
      overflow: visible !important;
    }

    .package-dialog {
      width: 520px;
      max-width: 100%;
      background: #fff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      display: flex;
      flex-direction: column;
    }

    .dialog-accent-bar {
      height: 4px;
      background: linear-gradient(90deg, #7c3aed, #06b6d4, #7c3aed);
      background-size: 200% 100%;
      animation: shimmer 2s linear infinite;
    }

    .package-dialog.edit-mode .dialog-accent-bar {
      background: linear-gradient(90deg, #06b6d4, #22d3ee, #06b6d4);
      background-size: 200% 100%;
    }

    // ========== HEADER ==========
    .sd-header {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px 24px;
      background: linear-gradient(135deg, #f0f9ff 0%, #fff 100%);
      border-bottom: 1px solid #e0f2fe;
      position: relative;
    }

    .sd-header-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #7c3aed, #06b6d4);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(124, 58, 237, 0.2);

      mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
        color: #fff;
      }

      &.edit {
        background: linear-gradient(135deg, #06b6d4, #0891b2);
        box-shadow: 0 4px 12px rgba(6, 182, 212, 0.25);
      }
    }

    .sd-header-text {
      flex: 1;

      h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 700;
        color: #1f2937;
        letter-spacing: -0.01em;
      }

      p {
        margin: 2px 0 0;
        font-size: 12px;
        color: #6b7280;
      }
    }

    .sd-close-btn {
      position: absolute;
      top: 16px;
      right: 16px;
      width: 32px;
      height: 32px;
      border: none;
      background: rgba(0, 0, 0, 0.05);
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: #6b7280;
      }

      &:hover {
        background: rgba(0, 0, 0, 0.1);
        transform: scale(1.05);
      }
    }

    // ========== BODY ==========
    .sd-body {
      padding: 24px;
      max-height: 60vh;
      overflow-y: auto;
    }

    .sd-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .sd-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    // ========== FIELD ==========
    .sd-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .sd-field-desc {
      font-size: 11px;
      color: #6b7280;
      margin: 0 0 2px;
    }

    .sd-label {
      font-size: 13px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 1px;

      .required {
        color: #ef4444;
      }

      .optional {
        font-size: 11px;
        color: #9ca3af;
        font-weight: 500;
      }
    }

    .sd-label-with-badge {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .auto-sum-badge {
        font-size: 10px;
        background: #ede9fe;
        color: #7c3aed;
        padding: 2px 8px;
        border-radius: 20px;
        font-weight: 600;
      }
    }

    .sd-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      background: #f9fafb;
      transition: all 0.2s ease;
      overflow: hidden;

      &.focused {
        border-color: #7c3aed;
        background: #fff;
        box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.1);
        
        .input-icon {
          color: #7c3aed;
        }
      }

      &.readonly {
        background: #f3f4f6;
        border-color: #e5e7eb;
        
        input {
          cursor: not-allowed;
          color: #6b7280;
        }
      }

      &.error {
        border-color: #ef4444;
        background: #fef2f2;
        
        .input-icon {
          color: #ef4444;
        }
      }

      .input-icon {
        margin-left: 14px;
        color: #9ca3af;
        font-size: 20px;
        width: 20px;
        height: 20px;
        transition: color 0.2s ease;
        flex-shrink: 0;
      }

      input, select, textarea {
        flex: 1;
        width: 100%;
        padding: 13px 16px 13px 10px;
        border: none;
        background: transparent;
        font-size: 14px;
        color: #1f2937;
        outline: none;
        box-sizing: border-box;
        font-family: inherit;

        &::placeholder {
          color: #9ca3af;
        }
      }

      textarea {
        resize: none;
        line-height: 1.5;
        padding-top: 13px;
      }

      select {
        appearance: none;
        cursor: pointer;
        padding-right: 40px;
      }

      .select-arrow {
        position: absolute;
        right: 14px;
        color: #9ca3af;
        pointer-events: none;
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      .input-suffix {
        margin-right: 16px;
        color: #6b7280;
        font-size: 13px;
        font-weight: 500;
        pointer-events: none;
        user-select: none;
      }

      .discount-percent-tag {
        margin-right: 12px;
        background: #ef4444;
        color: #fff;
        font-size: 11px;
        font-weight: 700;
        padding: 4px 8px;
        border-radius: 20px;
        animation: pulse 1.5s infinite;
      }

      &.textarea {
        align-items: flex-start;
        
        .input-icon {
          margin-top: 13px;
        }
      }
    }

    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }

    .sd-error {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #ef4444;
      margin-top: 2px;

      mat-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
      }
    }

    // ========== CUSTOM SERVICES GRID ==========
    .sd-services-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      max-height: 160px;
      overflow-y: auto;
      padding: 6px;
      border: 2px dashed #e5e7eb;
      border-radius: 12px;
      background: #f9fafb;
      
      &::-webkit-scrollbar {
        width: 6px;
      }
      &::-webkit-scrollbar-thumb {
        background: #d1d5db;
        border-radius: 10px;
      }
    }

    .service-badge-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: #fff;
      border: 1.5px solid #e5e7eb;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
      color: #4b5563;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
      font-family: inherit;

      .badge-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
        color: #9ca3af;
      }

      .price {
        font-weight: 700;
        color: #6b7280;
        margin-left: 2px;
      }

      .check-mark {
        font-size: 14px;
        width: 14px;
        height: 14px;
        color: #7c3aed;
        margin-left: 4px;
      }

      &:hover {
        border-color: #c4b5fd;
        background: #fbfaff;
      }

      &.active {
        background: #f5f3ff;
        border-color: #7c3aed;
        color: #7c3aed;
        box-shadow: 0 2px 6px rgba(124, 58, 237, 0.12);

        .badge-icon {
          color: #7c3aed;
        }

        .price {
          color: #7c3aed;
        }
      }
    }

    // ========== TOGGLE ==========
    .sd-toggle-field {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 16px;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 12px;
      gap: 16px;
      margin-top: 4px;
    }

    .sd-toggle-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .sd-toggle-icon {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fee2e2;
      transition: all 0.2s ease;
      flex-shrink: 0;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        color: #dc2626;
      }

      &.available {
        background: #d1fae5;

        mat-icon {
          color: #059669;
        }
      }
    }

    .sd-toggle-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .sd-toggle-label {
      font-size: 13px;
      font-weight: 600;
      color: #1f2937;
    }

    .sd-toggle-desc {
      font-size: 11px;
      color: #6b7280;
    }

    // ========== FOOTER ==========
    .sd-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px;
      background: #f9fafb;
      border-top: 1px solid #f3f4f6;
    }

    .sd-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 11px 22px;
      border: none;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      &.cancel {
        background: #fff;
        color: #6b7280;
        border: 1px solid #e5e7eb;

        &:hover {
          background: #f9fafb;
          border-color: #d1d5db;
        }
      }

      &.submit {
        background: linear-gradient(135deg, #7c3aed, #06b6d4);
        color: #fff;
        box-shadow: 0 4px 14px rgba(124, 58, 237, 0.3);

        &:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(124, 58, 237, 0.4);
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
      }
    }

    .sd-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    // ========== RESPONSIVE ==========
    @media (max-width: 600px) {
      .package-dialog {
        width: 100%;
        border-radius: 16px;
      }

      .sd-header {
        padding: 16px 20px;
        gap: 12px;
      }

      .sd-header-icon {
        width: 40px;
        height: 40px;

        mat-icon {
          font-size: 20px;
          width: 20px;
          height: 20px;
        }
      }

      .sd-header-text h2 {
        font-size: 16px;
      }

      .sd-close-btn {
        top: 12px;
        right: 12px;
        width: 28px;
        height: 28px;
      }

      .sd-body {
        padding: 20px;
        max-height: 55vh;
      }

      .sd-row {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .sd-input-wrapper input, 
      .sd-input-wrapper select,
      .sd-input-wrapper textarea {
        padding: 11px 14px 11px 10px;
      }

      .sd-toggle-field {
        padding: 12px;
      }

      .sd-footer {
        padding: 16px 20px;
        flex-direction: column-reverse;
        gap: 10px;
      }

      .sd-btn {
        width: 100%;
        padding: 13px 24px;
      }
    }

    @media (max-width: 400px) {
      .sd-header {
        padding: 12px 16px;
      }

      .sd-header-icon {
        width: 36px;
        height: 36px;

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }
      }

      .sd-header-text {
        h2 { font-size: 15px; }
        p { font-size: 11px; }
      }

      .sd-body {
        padding: 16px;
      }

      .sd-form {
        gap: 12px;
      }

      .sd-toggle-icon {
        width: 32px;
        height: 32px;

        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
        }
      }

      .sd-toggle-label { font-size: 12px; }
      .sd-toggle-desc { font-size: 10px; }
    }
  `]
})
export class PackageDialogComponent {
  form: FormGroup;
  saving = false;
  availableServices: any[] = [];
  discountPercent = 0;

  nameFocused = false;
  categoryFocused = false;
  originalPriceFocused = false;
  packagePriceFocused = false;
  validityFocused = false;
  redemptionsFocused = false;
  descriptionFocused = false;

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
      next: (services) => {
        this.availableServices = services;
        this.calculateOriginalPrice();
      },
      error: (err) => console.error('Failed to load services:', err)
    });
  }

  getCategoryMatIcon(category: string): string {
    const icons: Record<string, string> = {
      hair: 'content_cut',
      skin: 'face',
      nails: 'back_hand',
      makeup: 'brush',
      spa: 'spa'
    };
    return icons[category?.toLowerCase()] || 'spa';
  }

  isServiceSelected(serviceId: string): boolean {
    return this.form.get('selectedServices')?.value.includes(serviceId);
  }

  toggleService(serviceId: string): void {
    const selected = [...this.form.get('selectedServices')?.value];
    const index = selected.indexOf(serviceId);
    if (index > -1) {
      selected.splice(index, 1);
    } else {
      selected.push(serviceId);
    }
    this.form.get('selectedServices')?.setValue(selected);
    this.form.get('selectedServices')?.markAsTouched();
    
    // Auto-calculate sum and update discount percent!
    this.calculateOriginalPrice();
  }

  calculateOriginalPrice(): void {
    const selectedIds = this.form.get('selectedServices')?.value || [];
    let sum = 0;
    
    selectedIds.forEach((id: string) => {
      const match = this.availableServices.find(s => s._id === id);
      if (match) {
        sum += match.price;
      }
    });

    this.form.get('originalPrice')?.setValue(sum);
    this.calculateDiscount();
  }

  calculateDiscount(): void {
    const orig = Number(this.form.get('originalPrice')?.value || 0);
    const pack = Number(this.form.get('packagePrice')?.value || 0);
    if (orig > 0 && pack > 0 && orig > pack) {
      this.discountPercent = Math.round(((orig - pack) / orig) * 100);
    } else {
      this.discountPercent = 0;
    }
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
