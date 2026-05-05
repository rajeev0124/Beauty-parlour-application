import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface CouponFormData {
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscount: number | null;
  startDate: Date;
  endDate: Date;
  maxUsage: number | null;
  applicableOn: string[];
}

@Component({
  selector: 'app-coupon-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatDialogModule, MatFormFieldModule, 
    MatInputModule, MatSelectModule, MatButtonModule, MatDatepickerModule, 
    MatNativeDateModule, MatSnackBarModule, MatProgressSpinnerModule,
    MatIconModule, MatTooltipModule
  ],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="coupon-dialog">
      <!-- Header -->
      <div class="dialog-header">
        <div class="header-icon">
          <mat-icon>{{ data ? 'edit' : 'add_circle' }}</mat-icon>
        </div>
        <div class="header-text">
          <h2>{{ data ? 'Edit Coupon' : 'Create New Coupon' }}</h2>
          <p>{{ data ? 'Update coupon details' : 'Set up a discount code for customers' }}</p>
        </div>
        <button mat-icon-button class="close-btn" (click)="dialogRef.close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Content -->
      <div class="dialog-content">
        <!-- Coupon Preview Card -->
        <div class="coupon-preview">
          <div class="preview-badge" [class.percentage]="coupon.discountType === 'percentage'" [class.fixed]="coupon.discountType === 'fixed'">
            <span class="discount-value">
              @if (coupon.discountType === 'percentage') {
                {{ coupon.discountValue || 0 }}%
              } @else {
                ₹{{ coupon.discountValue || 0 }}
              }
            </span>
            <span class="discount-label">OFF</span>
          </div>
          <div class="preview-details">
            <span class="preview-code">{{ coupon.code || 'CODE' }}</span>
            <span class="preview-desc">{{ coupon.description || 'Description' }}</span>
          </div>
        </div>

        <!-- Form Sections -->
        <div class="form-section">
          <div class="section-header">
            <mat-icon>label</mat-icon>
            <span>Basic Information</span>
          </div>
          
          <div class="form-grid">
            <div class="form-field">
              <label>Coupon Code <span class="required">*</span></label>
              <div class="input-wrapper code-input">
                <mat-icon>confirmation_number</mat-icon>
                <input 
                  type="text" 
                  [(ngModel)]="coupon.code" 
                  placeholder="e.g., SUMMER20"
                  [disabled]="!!data"
                  (input)="coupon.code = coupon.code.toUpperCase()">
              </div>
              <span class="field-hint">Unique code (auto-uppercased)</span>
            </div>

            <div class="form-field full-width">
              <label>Description <span class="required">*</span></label>
              <div class="input-wrapper">
                <mat-icon>description</mat-icon>
                <input 
                  type="text" 
                  [(ngModel)]="coupon.description" 
                  placeholder="e.g., Summer Sale 20% Off">
              </div>
            </div>
          </div>
        </div>

        <div class="form-section">
          <div class="section-header">
            <mat-icon>local_offer</mat-icon>
            <span>Discount Settings</span>
          </div>
          
          <div class="form-grid">
            <div class="form-field">
              <label>Discount Type <span class="required">*</span></label>
              <div class="type-selector">
                <button 
                  type="button"
                  class="type-btn" 
                  [class.active]="coupon.discountType === 'percentage'"
                  (click)="coupon.discountType = 'percentage'">
                  <mat-icon>percent</mat-icon>
                  <span>Percentage</span>
                </button>
                <button 
                  type="button"
                  class="type-btn" 
                  [class.active]="coupon.discountType === 'fixed'"
                  (click)="coupon.discountType = 'fixed'">
                  <mat-icon>currency_rupee</mat-icon>
                  <span>Fixed Amount</span>
                </button>
              </div>
            </div>

            <div class="form-field">
              <label>Discount Value <span class="required">*</span></label>
              <div class="input-wrapper value-input" [class.percentage]="coupon.discountType === 'percentage'">
                <mat-icon>{{ coupon.discountType === 'percentage' ? 'percent' : 'currency_rupee' }}</mat-icon>
                <input 
                  type="number" 
                  [(ngModel)]="coupon.discountValue" 
                  [min]="1" 
                  [max]="coupon.discountType === 'percentage' ? 100 : 99999"
                  placeholder="0">
                <span class="suffix">{{ coupon.discountType === 'percentage' ? '%' : '₹' }}</span>
              </div>
              <span class="field-hint">{{ coupon.discountType === 'percentage' ? 'Enter value between 1-100' : 'Enter amount in rupees' }}</span>
            </div>

            <div class="form-field">
              <label>Min Order Amount</label>
              <div class="input-wrapper">
                <mat-icon>shopping_cart</mat-icon>
                <input 
                  type="number" 
                  [(ngModel)]="coupon.minOrderAmount" 
                  [min]="0"
                  placeholder="0">
                <span class="suffix">₹</span>
              </div>
              <span class="field-hint">Minimum cart value required</span>
            </div>

            <div class="form-field" [class.disabled]="coupon.discountType === 'fixed'">
              <label>Max Discount Cap</label>
              <div class="input-wrapper">
                <mat-icon>savings</mat-icon>
                <input 
                  type="number" 
                  [(ngModel)]="coupon.maxDiscount" 
                  [disabled]="coupon.discountType === 'fixed'"
                  placeholder="No limit">
                <span class="suffix">₹</span>
              </div>
              <span class="field-hint">{{ coupon.discountType === 'fixed' ? 'Not applicable for fixed amount' : 'Maximum discount amount' }}</span>
            </div>
          </div>
        </div>

        <div class="form-section">
          <div class="section-header">
            <mat-icon>date_range</mat-icon>
            <span>Validity Period</span>
          </div>
          
          <div class="form-grid">
            <div class="form-field">
              <label>Start Date <span class="required">*</span></label>
              <div class="input-wrapper date-input">
                <mat-icon>event</mat-icon>
                <input 
                  matInput 
                  [matDatepicker]="startPicker" 
                  [(ngModel)]="coupon.startDate"
                  placeholder="Select start date"
                  readonly>
                <mat-datepicker-toggle [for]="startPicker"></mat-datepicker-toggle>
                <mat-datepicker #startPicker></mat-datepicker>
              </div>
            </div>

            <div class="form-field">
              <label>End Date <span class="required">*</span></label>
              <div class="input-wrapper date-input" [class.error]="coupon.endDate && coupon.startDate && coupon.endDate < coupon.startDate">
                <mat-icon>event</mat-icon>
                <input 
                  matInput 
                  [matDatepicker]="endPicker" 
                  [(ngModel)]="coupon.endDate"
                  [min]="coupon.startDate"
                  placeholder="Select end date"
                  readonly>
                <mat-datepicker-toggle [for]="endPicker"></mat-datepicker-toggle>
                <mat-datepicker #endPicker></mat-datepicker>
              </div>
              @if (coupon.endDate && coupon.startDate && coupon.endDate < coupon.startDate) {
                <span class="field-error">End date must be after start date</span>
              }
            </div>
          </div>
        </div>

        <div class="form-section">
          <div class="section-header">
            <mat-icon>tune</mat-icon>
            <span>Usage Limits</span>
          </div>
          
          <div class="form-grid">
            <div class="form-field">
              <label>Maximum Usage</label>
              <div class="input-wrapper">
                <mat-icon>repeat</mat-icon>
                <input 
                  type="number" 
                  [(ngModel)]="coupon.maxUsage" 
                  [min]="1"
                  placeholder="Unlimited">
              </div>
              <span class="field-hint">Leave empty for unlimited usage</span>
            </div>

            <div class="form-field">
              <label>Applicable On <span class="required">*</span></label>
              <div class="applicable-chips">
                <button 
                  type="button"
                  class="chip" 
                  [class.active]="coupon.applicableOn.includes('all')"
                  (click)="toggleApplicable('all')">
                  <mat-icon>apps</mat-icon>
                  All
                </button>
                <button 
                  type="button"
                  class="chip" 
                  [class.active]="coupon.applicableOn.includes('service')"
                  (click)="toggleApplicable('service')">
                  <mat-icon>spa</mat-icon>
                  Services
                </button>
                <button 
                  type="button"
                  class="chip" 
                  [class.active]="coupon.applicableOn.includes('product')"
                  (click)="toggleApplicable('product')">
                  <mat-icon>inventory_2</mat-icon>
                  Products
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="dialog-footer">
        <button mat-button class="cancel-btn" (click)="dialogRef.close()" [disabled]="saving">
          Cancel
        </button>
        <button 
          mat-raised-button 
          class="save-btn" 
          (click)="save()" 
          [disabled]="!isValid() || saving">
          @if (saving) {
            <mat-spinner diameter="20"></mat-spinner>
            <span>Saving...</span>
          } @else {
            <ng-container>
              <mat-icon>{{ data ? 'save' : 'add' }}</mat-icon>
              <span>{{ data ? 'Update Coupon' : 'Create Coupon' }}</span>
            </ng-container>
          }
        </button>
      </div>
    </div>
  `,
  styles: [`
    .coupon-dialog {
      background: white;
      border-radius: 20px;
      overflow: hidden;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
    }

    /* Header */
    .dialog-header {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      padding: 20px 24px;
      display: flex;
      align-items: center;
      gap: 16px;
      position: relative;

      .header-icon {
        width: 48px;
        height: 48px;
        background: rgba(255,255,255,0.2);
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;

        mat-icon {
          font-size: 26px;
          width: 26px;
          height: 26px;
          color: white;
        }
      }

      .header-text {
        flex: 1;

        h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: white;
        }

        p {
          margin: 4px 0 0;
          font-size: 13px;
          color: rgba(255,255,255,0.85);
        }
      }

      .close-btn {
        color: rgba(255,255,255,0.8);
        position: absolute;
        top: 12px;
        right: 12px;

        &:hover {
          color: white;
          background: rgba(255,255,255,0.15);
        }
      }
    }

    /* Content */
    .dialog-content {
      padding: 24px;
      overflow-y: auto;
      max-height: calc(90vh - 180px);
    }

    /* Coupon Preview */
    .coupon-preview {
      background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
      border: 2px dashed #f59e0b;
      border-radius: 16px;
      padding: 16px 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;

      .preview-badge {
        min-width: 80px;
        height: 80px;
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);

        &.percentage {
          background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
        }

        &.fixed {
          background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
        }

        .discount-value {
          font-size: 22px;
          font-weight: 700;
          color: white;
          line-height: 1;
        }

        .discount-label {
          font-size: 11px;
          font-weight: 600;
          color: rgba(255,255,255,0.9);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
      }

      .preview-details {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;

        .preview-code {
          font-size: 18px;
          font-weight: 700;
          color: #1f2937;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .preview-desc {
          font-size: 13px;
          color: #6b7280;
        }
      }
    }

    /* Form Sections */
    .form-section {
      margin-bottom: 24px;

      .section-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 16px;
        padding-bottom: 8px;
        border-bottom: 2px solid #f3f4f6;

        mat-icon {
          font-size: 20px;
          width: 20px;
          height: 20px;
          color: #f59e0b;
        }

        span {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
      }
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    .form-field {
      &.full-width {
        grid-column: 1 / -1;
      }

      &.disabled {
        opacity: 0.5;
        pointer-events: none;
      }

      label {
        display: block;
        font-size: 13px;
        font-weight: 500;
        color: #374151;
        margin-bottom: 8px;

        .required {
          color: #ef4444;
        }
      }

      .field-hint {
        display: block;
        font-size: 11px;
        color: #9ca3af;
        margin-top: 6px;
      }

      .field-error {
        display: block;
        font-size: 11px;
        color: #ef4444;
        margin-top: 6px;
      }
    }

    .input-wrapper {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      background: #f9fafb;
      transition: all 0.3s ease;

      &:focus-within {
        border-color: #f59e0b;
        background: white;
        box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.1);
      }

      &.error {
        border-color: #ef4444;
        background: #fef2f2;
      }

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        color: #9ca3af;
      }

      input {
        flex: 1;
        border: none;
        background: transparent;
        font-size: 14px;
        color: #1f2937;
        outline: none;
        min-width: 0;

        &::placeholder {
          color: #9ca3af;
        }

        &:disabled {
          color: #6b7280;
          cursor: not-allowed;
        }
      }

      .suffix {
        font-size: 14px;
        font-weight: 600;
        color: #6b7280;
      }

      &.code-input input {
        text-transform: uppercase;
        font-weight: 600;
        letter-spacing: 0.1em;
      }

      &.value-input.percentage {
        border-color: #ddd6fe;
        background: #faf5ff;

        &:focus-within {
          border-color: #7c3aed;
          box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.1);
        }
      }

      &.date-input {
        padding-right: 4px;

        mat-datepicker-toggle {
          margin-left: auto;
        }

        ::ng-deep .mat-mdc-icon-button {
          width: 36px;
          height: 36px;
        }
      }
    }

    /* Type Selector */
    .type-selector {
      display: flex;
      gap: 12px;

      .type-btn {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 12px;
        border: 2px solid #e5e7eb;
        border-radius: 12px;
        background: #f9fafb;
        cursor: pointer;
        transition: all 0.3s ease;

        mat-icon {
          font-size: 20px;
          width: 20px;
          height: 20px;
          color: #6b7280;
        }

        span {
          font-size: 13px;
          font-weight: 500;
          color: #6b7280;
        }

        &:hover {
          border-color: #f59e0b;
          background: #fffbeb;
        }

        &.active {
          border-color: #f59e0b;
          background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);

          mat-icon, span {
            color: #d97706;
          }
        }
      }
    }

    /* Applicable Chips */
    .applicable-chips {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;

      .chip {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 10px 16px;
        border: 2px solid #e5e7eb;
        border-radius: 24px;
        background: white;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 13px;
        font-weight: 500;
        color: #6b7280;

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }

        &:hover {
          border-color: #f59e0b;
          color: #d97706;
        }

        &.active {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          border-color: transparent;
          color: white;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
        }
      }
    }

    /* Footer */
    .dialog-footer {
      padding: 16px 24px;
      background: #f9fafb;
      border-top: 1px solid #e5e7eb;
      display: flex;
      justify-content: flex-end;
      gap: 12px;

      .cancel-btn {
        padding: 0 24px;
        height: 44px;
        border-radius: 12px;
        font-weight: 500;
        color: #6b7280;

        &:hover {
          background: #e5e7eb;
        }
      }

      .save-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 0 24px;
        height: 44px;
        border-radius: 12px;
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important;
        color: white !important;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
        transition: all 0.3s ease;

        mat-icon {
          font-size: 20px;
          width: 20px;
          height: 20px;
        }

        mat-spinner {
          margin-right: 4px;
        }

        &:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(245, 158, 11, 0.4);
        }

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }
    }

    /* Responsive */
    @media (max-width: 600px) {
      .dialog-content {
        padding: 16px;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .coupon-preview {
        flex-direction: column;
        text-align: center;

        .preview-details {
          align-items: center;
        }
      }

      .type-selector {
        flex-direction: column;
      }

      .applicable-chips {
        justify-content: center;

        .chip {
          flex: 1;
          justify-content: center;
          min-width: 90px;
        }
      }

      .dialog-footer {
        flex-direction: column;

        .cancel-btn, .save-btn {
          width: 100%;
          justify-content: center;
        }
      }
    }
  `]
})
export class CouponDialogComponent {
  saving = false;
  coupon: CouponFormData = {
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 0,
    maxDiscount: null,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    maxUsage: null,
    applicableOn: ['all']
  };

  constructor(
    public dialogRef: MatDialogRef<CouponDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CouponFormData | null,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    if (data) {
      this.coupon = { 
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate)
      };
    }
  }

  isValid(): boolean {
    const { code, description, discountValue, discountType, startDate, endDate, applicableOn } = this.coupon;
    
    if (!code?.trim() || !description?.trim()) return false;
    if (discountValue <= 0) return false;
    if (discountType === 'percentage' && discountValue > 100) return false;
    if (!startDate || !endDate) return false;
    if (new Date(endDate) < new Date(startDate)) return false;
    if (!applicableOn || applicableOn.length === 0) return false;
    
    return true;
  }

  toggleApplicable(value: string) {
    const index = this.coupon.applicableOn.indexOf(value);
    if (value === 'all') {
      // If selecting 'all', clear others and set just 'all'
      if (index === -1) {
        this.coupon.applicableOn = ['all'];
      } else {
        this.coupon.applicableOn = [];
      }
    } else {
      // If selecting service/product, remove 'all' first
      const allIndex = this.coupon.applicableOn.indexOf('all');
      if (allIndex > -1) {
        this.coupon.applicableOn.splice(allIndex, 1);
      }
      
      if (index === -1) {
        this.coupon.applicableOn.push(value);
      } else {
        this.coupon.applicableOn.splice(index, 1);
      }
    }
  }

  save() {
    if (!this.isValid() || this.saving) return;
    
    this.saving = true;
    const url = this.data 
      ? `${environment.apiUrl}/coupons/${(this.data as any)._id}`
      : `${environment.apiUrl}/coupons`;
    
    const method = this.data ? 'put' : 'post';
    
    this.http[method](url, this.coupon).subscribe({
      next: () => {
        this.saving = false;
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.saving = false;
        this.snackBar.open(err.error?.message || 'Error saving coupon', 'Close', { duration: 4000 });
      }
    });
  }
}
