import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
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
    CommonModule, FormsModule, MatDialogModule, MatInputModule,
    MatDatepickerModule, MatNativeDateModule, MatSnackBarModule, 
    MatProgressSpinnerModule, MatIconModule, MatTooltipModule
  ],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="coupon-dialog">
      <!-- Decorative gold shimmer accent bar -->
      <div class="dialog-accent-bar"></div>

      <!-- Header -->
      <div class="sd-header">
        <div class="sd-header-icon">
          <mat-icon>{{ data ? 'edit' : 'local_activity' }}</mat-icon>
        </div>
        <div class="sd-header-text">
          <h2>{{ data ? 'Edit Coupon' : 'Create New Coupon' }}</h2>
          <p>{{ data ? 'Update coupon settings' : 'Set up a discount code for customers' }}</p>
        </div>
        <button type="button" class="sd-close-btn" (click)="dialogRef.close()" aria-label="Close">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Content/Body -->
      <div class="sd-body">
        
        <!-- Premium Voucher Ticket Preview -->
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
          
          <div class="preview-separator"></div>
          
          <div class="preview-details">
            <span class="preview-code">{{ coupon.code || 'COUPON CODE' }}</span>
            <span class="preview-desc">{{ coupon.description || 'Enter coupon details below...' }}</span>
          </div>
          
          <div class="ticket-shimmer"></div>
        </div>

        <!-- Form Sections -->
        <!-- SECTION 1: Basic Information -->
        <div class="form-section">
          <div class="section-header">
            <mat-icon>label</mat-icon>
            <span>Basic Information</span>
          </div>
          
          <div class="form-grid">
            <div class="form-field">
              <label class="sd-label">Coupon Code <span class="required">*</span></label>
              <div class="sd-input-wrapper code-input" [class.focused]="codeFocused">
                <mat-icon class="input-icon">confirmation_number</mat-icon>
                <input 
                  type="text" 
                  [(ngModel)]="coupon.code" 
                  placeholder="e.g., SUMMER20"
                  [disabled]="!!data"
                  (input)="coupon.code = coupon.code.toUpperCase()"
                  (focus)="codeFocused = true"
                  (blur)="codeFocused = false">
              </div>
              <span class="field-hint">Unique identifier (auto-uppercased)</span>
            </div>

            <div class="form-field">
              <label class="sd-label">Description <span class="required">*</span></label>
              <div class="sd-input-wrapper" [class.focused]="descFocused">
                <mat-icon class="input-icon">description</mat-icon>
                <input 
                  type="text" 
                  [(ngModel)]="coupon.description" 
                  placeholder="e.g., Summer Sale 20% Off"
                  (focus)="descFocused = true"
                  (blur)="descFocused = false">
              </div>
              <span class="field-hint">Brief offer explanation for customers</span>
            </div>
          </div>
        </div>

        <!-- SECTION 2: Discount Settings -->
        <div class="form-section">
          <div class="section-header">
            <mat-icon>local_offer</mat-icon>
            <span>Discount Settings</span>
          </div>
          
          <div class="form-grid">
            <div class="form-field full-width">
              <label class="sd-label">Discount Type <span class="required">*</span></label>
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
              <label class="sd-label">Discount Value <span class="required">*</span></label>
              <div class="sd-input-wrapper value-input" [class.focused]="valFocused" [class.percentage]="coupon.discountType === 'percentage'">
                <mat-icon class="input-icon">{{ coupon.discountType === 'percentage' ? 'percent' : 'currency_rupee' }}</mat-icon>
                <input 
                  type="number" 
                  [(ngModel)]="coupon.discountValue" 
                  [min]="1" 
                  [max]="coupon.discountType === 'percentage' ? 100 : 99999"
                  placeholder="0"
                  (focus)="valFocused = true"
                  (blur)="valFocused = false">
                <span class="suffix-badge">{{ coupon.discountType === 'percentage' ? '%' : '₹' }}</span>
              </div>
              <span class="field-hint">{{ coupon.discountType === 'percentage' ? 'Value between 1 and 100%' : 'Fixed amount in rupees' }}</span>
            </div>

            <div class="form-field">
              <label class="sd-label">Min Order Amount</label>
              <div class="sd-input-wrapper" [class.focused]="minFocused">
                <mat-icon class="input-icon">shopping_cart</mat-icon>
                <input 
                  type="number" 
                  [(ngModel)]="coupon.minOrderAmount" 
                  [min]="0"
                  placeholder="0"
                  (focus)="minFocused = true"
                  (blur)="minFocused = false">
                <span class="suffix-badge">₹</span>
              </div>
              <span class="field-hint">Minimum required cart value</span>
            </div>

            <div class="form-field" [class.disabled]="coupon.discountType === 'fixed'">
              <label class="sd-label">Max Discount Cap</label>
              <div class="sd-input-wrapper" [class.focused]="maxFocused">
                <mat-icon class="input-icon">savings</mat-icon>
                <input 
                  type="number" 
                  [(ngModel)]="coupon.maxDiscount" 
                  [disabled]="coupon.discountType === 'fixed'"
                  placeholder="No limit"
                  (focus)="maxFocused = true"
                  (blur)="maxFocused = false">
                <span class="suffix-badge">₹</span>
              </div>
              <span class="field-hint">{{ coupon.discountType === 'fixed' ? 'Not applicable for fixed amount' : 'Maximum discount limit' }}</span>
            </div>
          </div>
        </div>

        <!-- SECTION 3: Validity Period -->
        <div class="form-section">
          <div class="section-header">
            <mat-icon>date_range</mat-icon>
            <span>Validity Period</span>
          </div>
          
          <div class="form-grid">
            <div class="form-field">
              <label class="sd-label">Start Date <span class="required">*</span></label>
              <div class="sd-input-wrapper date-picker-wrapper" [class.focused]="startFocused">
                <mat-icon class="input-icon">event</mat-icon>
                <input 
                  matInput 
                  [matDatepicker]="startPicker" 
                  [(ngModel)]="coupon.startDate"
                  placeholder="Select start date"
                  readonly
                  (focus)="startFocused = true"
                  (blur)="startFocused = false">
                <mat-datepicker-toggle [for]="startPicker"></mat-datepicker-toggle>
                <mat-datepicker #startPicker></mat-datepicker>
              </div>
            </div>

            <div class="form-field">
              <label class="sd-label">End Date <span class="required">*</span></label>
              <div class="sd-input-wrapper date-picker-wrapper" [class.focused]="endFocused" [class.error]="coupon.endDate && coupon.startDate && coupon.endDate < coupon.startDate">
                <mat-icon class="input-icon">event</mat-icon>
                <input 
                  matInput 
                  [matDatepicker]="endPicker" 
                  [(ngModel)]="coupon.endDate"
                  [min]="coupon.startDate"
                  placeholder="Select end date"
                  readonly
                  (focus)="endFocused = true"
                  (blur)="endFocused = false">
                <mat-datepicker-toggle [for]="endPicker"></mat-datepicker-toggle>
                <mat-datepicker #endPicker></mat-datepicker>
              </div>
              @if (coupon.endDate && coupon.startDate && coupon.endDate < coupon.startDate) {
                <span class="field-error">End date must be after start date</span>
              }
            </div>
          </div>
        </div>

        <!-- SECTION 4: Usage Limits -->
        <div class="form-section">
          <div class="section-header">
            <mat-icon>tune</mat-icon>
            <span>Usage Limits</span>
          </div>
          
          <div class="form-grid">
            <div class="form-field">
              <label class="sd-label">Maximum Usage</label>
              <div class="sd-input-wrapper" [class.focused]="usageFocused">
                <mat-icon class="input-icon">repeat</mat-icon>
                <input 
                  type="number" 
                  [(ngModel)]="coupon.maxUsage" 
                  [min]="1"
                  placeholder="Unlimited"
                  (focus)="usageFocused = true"
                  (blur)="usageFocused = false">
              </div>
              <span class="field-hint">Leave blank for unlimited redemptions</span>
            </div>

            <div class="form-field">
              <label class="sd-label">Applicable On <span class="required">*</span></label>
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
      <div class="sd-footer">
        <button type="button" class="sd-btn cancel" (click)="dialogRef.close()" [disabled]="saving">
          <mat-icon>close</mat-icon>
          Cancel
        </button>
        <button type="button" class="sd-btn submit" (click)="save()" [disabled]="!isValid() || saving">
          @if (saving) {
            <div class="btn-spinner"></div>
            <span>Saving...</span>
          } @else {
            <mat-icon>{{ data ? 'save' : 'add' }}</mat-icon>
            <span>{{ data ? 'Update Coupon' : 'Create Coupon' }}</span>
          }
        </button>
      </div>
    </div>
  `,
  styles: [`
    .cdk-overlay-pane:has(.coupon-dialog) {
      max-width: 95vw !important;
    }

    .mat-mdc-dialog-container:has(.coupon-dialog) {
      --mdc-dialog-container-shape: 20px;
      padding: 0 !important;
      background: transparent !important;
      box-shadow: none !important;
    }

    .mat-mdc-dialog-container:has(.coupon-dialog) .mdc-dialog__surface {
      background: transparent !important;
      box-shadow: none !important;
      border-radius: 20px !important;
      overflow: visible !important;
    }

    .coupon-dialog {
      width: 100%;
      max-width: 580px;
      background: #fff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      display: flex;
      flex-direction: column;
    }

    .dialog-accent-bar {
      height: 4px;
      background: linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b);
      background-size: 200% 100%;
      animation: shimmer 2s linear infinite;
    }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    // ========== HEADER ==========
    .sd-header {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px 24px;
      background: linear-gradient(135deg, #fffbeb 0%, #fff 100%);
      border-bottom: 1px solid #fef3c7;
      position: relative;
    }

    .sd-header-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #f59e0b, #d97706);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);

      mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
        color: #fff;
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
      display: flex;
      flex-direction: column;
      gap: 20px;
      max-height: 60vh;
      overflow-y: auto;
    }

    // ========== VOUCHER CARD PREVIEW ==========
    .coupon-preview {
      position: relative;
      background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
      border: 1.5px solid #fde68a;
      border-radius: 16px;
      padding: 18px 24px;
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 8px;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(245, 158, 11, 0.08);

      /* Ticket side notches */
      &::before, &::after {
        content: '';
        position: absolute;
        top: 50%;
        width: 16px;
        height: 16px;
        background: #fff;
        border-radius: 50%;
        transform: translateY(-50%);
        z-index: 2;
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.03);
      }
      &::before { left: -9px; border-right: 1.5px solid #fde68a; }
      &::after { right: -9px; border-left: 1.5px solid #fde68a; }

      .preview-badge {
        min-width: 74px;
        height: 74px;
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
        z-index: 1;

        &.percentage {
          background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
        }

        &.fixed {
          background: linear-gradient(135deg, #10b981 0%, #047857 100%);
        }

        .discount-value {
          font-size: 20px;
          font-weight: 800;
          color: #fff;
          line-height: 1;
        }

        .discount-label {
          font-size: 10px;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.85);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-top: 2px;
        }
      }

      .preview-separator {
        height: 52px;
        border-left: 2px dashed #f59e0b;
        opacity: 0.4;
        z-index: 1;
      }

      .preview-details {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
        z-index: 1;

        .preview-code {
          font-size: 17px;
          font-weight: 800;
          color: #1f2937;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .preview-desc {
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
        }
      }

      .ticket-shimmer {
        position: absolute;
        top: 0;
        left: -100%;
        width: 50%;
        height: 100%;
        background: linear-gradient(
          90deg,
          rgba(255, 255, 255, 0) 0%,
          rgba(255, 255, 255, 0.3) 50%,
          rgba(255, 255, 255, 0) 100%
        );
        transform: skewX(-25deg);
        animation: ticketShimmer 4s infinite linear;
      }
    }

    @keyframes ticketShimmer {
      0% { left: -150%; }
      30% { left: 150%; }
      100% { left: 150%; }
    }

    // ========== FORM SECTIONS ==========
    .form-section {
      display: flex;
      flex-direction: column;
      gap: 14px;

      .section-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding-bottom: 6px;
        border-bottom: 2px solid #f3f4f6;

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
          color: #f59e0b;
        }

        span {
          font-size: 12px;
          font-weight: 700;
          color: #4b5563;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
      }
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 6px;

      &.full-width {
        grid-column: 1 / -1;
      }

      &.disabled {
        opacity: 0.55;
        pointer-events: none;
      }
    }

    .sd-label {
      font-size: 13px;
      font-weight: 600;
      color: #374151;

      .required {
        color: #ef4444;
      }
    }

    .field-hint {
      font-size: 11px;
      color: #9ca3af;
      font-weight: 500;
    }

    .field-error {
      font-size: 11px;
      color: #ef4444;
      font-weight: 600;
      margin-top: 1px;
    }

    // ========== INPUT WRAPPER ==========
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
        border-color: #f59e0b;
        background: #fff;
        box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.1);
        
        .input-icon {
          color: #f59e0b;
        }
      }

      &.error {
        border-color: #ef4444;
        background: #fef2f2;
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

      input {
        flex: 1;
        width: 100%;
        padding: 12px 16px 12px 10px;
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

      .suffix-badge {
        font-size: 13px;
        font-weight: 700;
        color: #6b7280;
        background: #e5e7eb;
        padding: 12px 14px;
        margin-left: auto;
      }

      &.code-input input {
        text-transform: uppercase;
        font-weight: 700;
        letter-spacing: 0.05em;
      }

      &.value-input.percentage {
        &.focused {
          border-color: #7c3aed;
          box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.1);
          .input-icon { color: #7c3aed; }
        }
        .suffix-badge {
          background: #ede9fe;
          color: #6d28d9;
        }
      }

      &.date-picker-wrapper {
        padding-right: 8px;

        input {
          cursor: pointer;
        }

        ::ng-deep .mat-mdc-icon-button {
          width: 32px;
          height: 32px;
          padding: 0;
          
          .mat-mdc-button-touch-target {
            display: none;
          }
        }
      }
    }

    // ========== TYPE SELECTOR BUTTONS ==========
    .type-selector {
      display: flex;
      gap: 12px;

      .type-btn {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 13px;
        border: 2px solid #e5e7eb;
        border-radius: 12px;
        background: #f9fafb;
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: inherit;

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
          color: #6b7280;
          transition: color 0.2s ease;
        }

        span {
          font-size: 13px;
          font-weight: 600;
          color: #4b5563;
          transition: color 0.2s ease;
        }

        &:hover {
          border-color: #f59e0b;
          background: #fffbeb;
        }

        &.active {
          border-color: #f59e0b;
          background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
          box-shadow: inset 0 2px 4px rgba(245, 158, 11, 0.05);

          mat-icon, span {
            color: #d97706;
          }
        }
      }
    }

    // ========== APPLICABLE CHIPS ==========
    .applicable-chips {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;

      .chip {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 10px 18px;
        border: 2px solid #e5e7eb;
        border-radius: 24px;
        background: #fff;
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 13px;
        font-weight: 600;
        color: #4b5563;
        font-family: inherit;

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }

        &:hover {
          border-color: #f59e0b;
          color: #d97706;
          background: #fffbeb;
        }

        &.active {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          border-color: transparent;
          color: #fff;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25);
        }
      }
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
        background: linear-gradient(135deg, #f59e0b, #d97706);
        color: #fff;
        box-shadow: 0 4px 14px rgba(245, 158, 11, 0.3);

        &:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
        }

        &:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .btn-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
      }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    // ========== RESPONSIVE ==========
    @media (max-width: 600px) {
      .coupon-dialog {
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
        gap: 16px;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .coupon-preview {
        padding: 16px 14px;
        gap: 12px;

        &::before { left: -9px; }
        &::after { right: -9px; }

        .preview-badge {
          min-width: 64px;
          height: 64px;

          .discount-value { font-size: 17px; }
          .discount-label { font-size: 9px; }
        }

        .preview-details {
          text-align: center;
          
          .preview-code { font-size: 15px; }
          .preview-desc { font-size: 11px; }
        }
      }

      .type-selector {
        flex-direction: column;
        gap: 8px;
      }

      .applicable-chips {
        .chip {
          flex: 1 1 calc(50% - 6px);
          justify-content: center;
        }
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

  // Focus indicators
  codeFocused = false;
  descFocused = false;
  valFocused = false;
  minFocused = false;
  maxFocused = false;
  startFocused = false;
  endFocused = false;
  usageFocused = false;

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
      if (index === -1) {
        this.coupon.applicableOn = ['all'];
      } else {
        this.coupon.applicableOn = [];
      }
    } else {
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
