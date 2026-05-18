import { Component, Inject, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface ExpenseCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
}

@Component({
  selector: 'app-expense-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatDialogModule, MatFormFieldModule, 
    MatInputModule, MatButtonModule, MatDatepickerModule, MatNativeDateModule,
    MatIconModule, MatTooltipModule
  ],
  template: `
    <div class="expense-dialog">
      <div class="dialog-accent-bar"></div>
      
      <!-- Header -->
      <div class="dialog-header">
        <div class="header-icon">
          <mat-icon>{{ data ? 'edit_square' : 'account_balance_wallet' }}</mat-icon>
        </div>
        <div class="header-text">
          <h2>{{ data ? 'Edit Expense' : 'Record New Expense' }}</h2>
          <p>{{ data ? 'Update your business expense details' : 'Log a new transaction to the business ledger' }}</p>
        </div>
        <button class="close-btn" (click)="dialogRef.close()" matTooltip="Close">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Content -->
      <div class="dialog-body">
        
        <!-- Category Selection -->
        <div class="form-group">
          <label class="form-label">
            <mat-icon>category</mat-icon>
            Select Category
          </label>
          <div class="category-grid">
            @for (cat of categories; track cat.id) {
              <button 
                type="button"
                class="category-btn" 
                [class.active]="expense.category === cat.id"
                [style.--cat-color]="cat.color"
                (click)="expense.category = cat.id">
                <div class="icon-circle">
                  <mat-icon>{{ cat.icon }}</mat-icon>
                </div>
                <span>{{ cat.name }}</span>
              </button>
            }
          </div>
        </div>

        <!-- Title -->
        <div class="form-group">
          <label class="form-label">
            <mat-icon>title</mat-icon>
            Expense Title <span class="required">*</span>
          </label>
          <div class="input-wrapper" [class.focused]="focusedField === 'title'">
            <mat-icon class="prefix-icon">description</mat-icon>
            <input 
              type="text" 
              [(ngModel)]="expense.title" 
              placeholder="e.g., Monthly Electricity Bill"
              class="form-input"
              (focus)="focusedField = 'title'" 
              (blur)="focusedField = null">
          </div>
        </div>

        <!-- Amount & Date Row -->
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">
              <mat-icon>payments</mat-icon>
              Amount <span class="required">*</span>
            </label>
            <div class="input-wrapper amount-input" [class.focused]="focusedField === 'amount'">
              <span class="currency-symbol">₹</span>
              <input 
                type="number" 
                [(ngModel)]="expense.amount" 
                placeholder="0.00"
                min="0"
                class="form-input"
                (focus)="focusedField = 'amount'" 
                (blur)="focusedField = null">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">
              <mat-icon>calendar_month</mat-icon>
              Date
            </label>
            <div class="input-wrapper date-input" [class.focused]="focusedField === 'date'">
              <input 
                matInput 
                [matDatepicker]="picker" 
                [(ngModel)]="expense.date"
                placeholder="Select date"
                class="form-input"
                (focus)="focusedField = 'date'" 
                (blur)="focusedField = null">
              <mat-datepicker-toggle [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
            </div>
          </div>
        </div>

        <!-- Payment Method -->
        <div class="form-group">
          <label class="form-label">
            <mat-icon>wallet</mat-icon>
            Payment Method
          </label>
          <div class="payment-grid">
            @for (method of paymentMethods; track method.id) {
              <button 
                type="button"
                class="payment-btn" 
                [class.active]="expense.paymentMethod === method.id"
                (click)="expense.paymentMethod = method.id">
                <mat-icon>{{ method.icon }}</mat-icon>
                <span>{{ method.name }}</span>
              </button>
            }
          </div>
        </div>

        <!-- Vendor & Description -->
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">
              <mat-icon>storefront</mat-icon>
              Vendor / Payee <span class="optional">(Optional)</span>
            </label>
            <div class="input-wrapper" [class.focused]="focusedField === 'vendor'">
              <mat-icon class="prefix-icon">person</mat-icon>
              <input 
                type="text" 
                [(ngModel)]="expense.vendor" 
                placeholder="e.g., ABC Suppliers"
                class="form-input"
                (focus)="focusedField = 'vendor'" 
                (blur)="focusedField = null">
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">
              <mat-icon>notes</mat-icon>
              Notes <span class="optional">(Optional)</span>
            </label>
            <div class="input-wrapper" [class.focused]="focusedField === 'desc'">
              <input 
                type="text" 
                [(ngModel)]="expense.description" 
                placeholder="Additional details..."
                class="form-input"
                (focus)="focusedField = 'desc'" 
                (blur)="focusedField = null">
            </div>
          </div>
        </div>

        <!-- Sleek Receipt Preview Card -->
        <div class="receipt-preview" [style.--theme-color]="getSelectedCategory()?.color || '#10b981'">
          <div class="receipt-icon">
            <mat-icon>{{ getSelectedCategory()?.icon || 'receipt' }}</mat-icon>
          </div>
          <div class="receipt-details">
            <div class="receipt-title">{{ expense.title || 'Expense Summary' }}</div>
            <div class="receipt-badges">
              <span class="badge category-badge">{{ getSelectedCategory()?.name || 'Uncategorized' }}</span>
              <span class="badge method-badge"><mat-icon>{{ getPaymentIcon() }}</mat-icon> {{ getPaymentName() }}</span>
              <span class="badge date-badge">{{ expense.date | date:'MMM d, y' }}</span>
            </div>
          </div>
          <div class="receipt-total">
            <span class="total-label">TOTAL</span>
            <span class="total-amount">₹{{ expense.amount | number:'1.0-0' }}</span>
          </div>
        </div>

      </div>

      <!-- Actions -->
      <div class="dialog-actions">
        <button class="btn-cancel" (click)="dialogRef.close()">
          <mat-icon>close</mat-icon> Cancel
        </button>
        <button class="btn-submit" (click)="save()" [disabled]="!isValid() || saving">
          @if (saving) {
            <span class="spinner"></span> Processing...
          } @else {
            <mat-icon>{{ data ? 'check_circle' : 'add_circle' }}</mat-icon>
            {{ data ? 'Update Expense' : 'Save Expense' }}
          }
        </button>
      </div>
    </div>
  `,
  styles: [`
    .cdk-overlay-pane:has(.expense-dialog) {
      max-width: 95vw !important;
    }

    .mat-mdc-dialog-container:has(.expense-dialog) {
      --mdc-dialog-container-shape: 24px;
      padding: 0 !important;
      background: transparent !important;
      box-shadow: none !important;
    }

    .mat-mdc-dialog-container:has(.expense-dialog) .mdc-dialog__surface {
      background: transparent !important;
      box-shadow: none !important;
      border-radius: 24px !important;
      overflow: visible !important;
    }

    .expense-dialog {
      width: 100%;
      max-width: 600px;
      background: #ffffff;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      display: flex;
      flex-direction: column;
      font-family: 'Outfit', 'Inter', sans-serif;
    }

    .dialog-accent-bar {
      height: 5px;
      background: linear-gradient(90deg, #10b981, #34d399, #059669);
      background-size: 200% 100%;
      animation: shimmer 2s linear infinite;
    }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    // ========== HEADER ==========
    .dialog-header {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 24px;
      background: linear-gradient(to right, #f8fafc, #ffffff);
      border-bottom: 1px solid #f1f5f9;
      position: relative;
    }

    .header-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #10b981, #059669);
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 16px rgba(16, 185, 129, 0.25);
      flex-shrink: 0;

      mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
        color: #ffffff;
      }
    }

    .header-text {
      flex: 1;

      h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 700;
        color: #1e293b;
        letter-spacing: -0.01em;
      }

      p {
        margin: 4px 0 0;
        font-size: 13px;
        color: #64748b;
      }
    }

    .close-btn {
      position: absolute;
      top: 20px;
      right: 20px;
      width: 32px;
      height: 32px;
      background: #f1f5f9;
      border: none;
      border-radius: 8px;
      color: #64748b;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;

      &:hover {
        background: #e2e8f0;
        color: #0f172a;
        transform: scale(1.05);
      }

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
    }

    // ========== BODY ==========
    .dialog-body {
      padding: 24px;
      overflow-y: auto;
      max-height: calc(85vh - 150px);
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      font-weight: 600;
      color: #334155;

      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
        color: #94a3b8;
      }

      .required { color: #ef4444; }
      .optional { font-weight: 400; color: #94a3b8; font-size: 11px; }
    }

    // ========== PREMIUM INPUTS ==========
    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      background: #f8fafc;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      transition: all 0.2s ease;
      overflow: hidden;

      &.focused {
        background: #ffffff;
        border-color: #10b981;
        box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);

        .prefix-icon, .currency-symbol {
          color: #10b981;
        }
      }

      .prefix-icon {
        margin-left: 12px;
        color: #94a3b8;
        font-size: 20px;
        width: 20px;
        height: 20px;
        transition: color 0.2s ease;
        flex-shrink: 0;
      }

      .currency-symbol {
        margin-left: 14px;
        color: #64748b;
        font-weight: 700;
        font-size: 16px;
        transition: color 0.2s ease;
      }

      .form-input {
        flex: 1;
        width: 100%;
        padding: 12px 14px;
        border: none;
        background: transparent;
        font-size: 14px;
        font-weight: 500;
        color: #1e293b;
        outline: none;
        font-family: inherit;

        &::placeholder {
          color: #94a3b8;
          font-weight: 400;
        }
      }

      &.date-input {
        .mat-datepicker-toggle {
          margin-right: 4px;
          --mat-datepicker-toggle-icon-color: #64748b;
        }
      }
    }

    // ========== CATEGORY GRID ==========
    .category-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
    }

    .category-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      padding: 12px 6px;
      background: #ffffff;
      border: 2px solid #e2e8f0;
      border-radius: 14px;
      cursor: pointer;
      transition: all 0.2s ease;

      .icon-circle {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        background: #f1f5f9;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
          color: #64748b;
          transition: all 0.2s ease;
        }
      }

      span {
        font-size: 11px;
        font-weight: 600;
        color: #64748b;
        text-align: center;
        transition: all 0.2s ease;
      }

      &:hover {
        border-color: #cbd5e1;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      }

      &.active {
        border-color: var(--cat-color);
        background: color-mix(in srgb, var(--cat-color) 4%, white);

        .icon-circle {
          background: var(--cat-color);
          box-shadow: 0 4px 10px color-mix(in srgb, var(--cat-color) 40%, transparent);

          mat-icon { color: white; }
        }

        span { color: #0f172a; }
      }
    }

    // ========== PAYMENT GRID ==========
    .payment-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
    }

    .payment-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 10px;
      background: #ffffff;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s ease;

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: #64748b;
      }

      span {
        font-size: 12px;
        font-weight: 600;
        color: #64748b;
      }

      &:hover {
        border-color: #cbd5e1;
        background: #f8fafc;
      }

      &.active {
        border-color: #10b981;
        background: rgba(16, 185, 129, 0.08);

        mat-icon, span {
          color: #10b981;
        }
      }
    }

    // ========== RECEIPT PREVIEW ==========
    .receipt-preview {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-top: 8px;
      padding: 16px 20px;
      background: #ffffff;
      border: 1px dashed #cbd5e1;
      border-radius: 16px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 6px;
        background: var(--theme-color);
      }

      .receipt-icon {
        width: 44px;
        height: 44px;
        background: color-mix(in srgb, var(--theme-color) 15%, white);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        mat-icon {
          font-size: 24px;
          width: 24px;
          height: 24px;
          color: var(--theme-color);
        }
      }

      .receipt-details {
        flex: 1;
        min-width: 0;

        .receipt-title {
          font-size: 15px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 6px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .receipt-badges {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;

          .badge {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 600;
            
            &.category-badge {
              background: color-mix(in srgb, var(--theme-color) 10%, white);
              color: var(--theme-color);
            }

            &.method-badge {
              background: #f1f5f9;
              color: #475569;

              mat-icon {
                font-size: 12px;
                width: 12px;
                height: 12px;
              }
            }

            &.date-badge {
              color: #64748b;
              font-weight: 500;
            }
          }
        }
      }

      .receipt-total {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        flex-shrink: 0;

        .total-label {
          font-size: 10px;
          font-weight: 700;
          color: #94a3b8;
          letter-spacing: 0.05em;
        }

        .total-amount {
          font-size: 22px;
          font-weight: 800;
          color: #0f172a;
          font-variant-numeric: tabular-nums;
        }
      }
    }

    // ========== ACTIONS ==========
    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px;
      background: #f8fafc;
      border-top: 1px solid #f1f5f9;
    }

    .btn-cancel, .btn-submit {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 24px;
      border-radius: 12px;
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
    }

    .btn-cancel {
      background: #ffffff;
      border: 2px solid #e2e8f0;
      color: #475569;

      &:hover {
        background: #f1f5f9;
        border-color: #cbd5e1;
      }
    }

    .btn-submit {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border: none;
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);

      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 16px rgba(16, 185, 129, 0.35);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        box-shadow: none;
        transform: none;
      }
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    // ========== RESPONSIVE ==========
    @media (max-width: 600px) {
      .expense-dialog {
        border-radius: 20px;
      }

      .dialog-header {
        padding: 20px;
      }

      .dialog-body {
        padding: 20px;
        gap: 16px;
      }

      .form-row {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .category-grid {
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;
      }

      .payment-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .receipt-preview {
        padding: 12px 14px;
        gap: 12px;

        .receipt-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;

          mat-icon {
            font-size: 20px;
            width: 20px;
            height: 20px;
          }
        }

        .receipt-badges {
          .date-badge {
            display: none; // Hide on very small screens to save space
          }
        }
      }

      .dialog-actions {
        padding: 16px 20px;
      }

      .btn-cancel, .btn-submit {
        padding: 12px 16px;
        font-size: 13px;
        flex: 1;
      }
    }
  `],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExpenseDialogComponent {
  saving = false;
  focusedField: string | null = null;
  
  categories: ExpenseCategory[] = [
    { id: 'rent', name: 'Rent', icon: 'home', color: '#ef4444' },
    { id: 'utilities', name: 'Utilities', icon: 'bolt', color: '#f59e0b' },
    { id: 'salary', name: 'Salary', icon: 'people', color: '#10b981' },
    { id: 'supplies', name: 'Supplies', icon: 'inventory_2', color: '#3b82f6' },
    { id: 'equipment', name: 'Equipment', icon: 'precision_manufacturing', color: '#8b5cf6' },
    { id: 'marketing', name: 'Marketing', icon: 'campaign', color: '#ec4899' },
    { id: 'maintenance', name: 'Maintenance', icon: 'build', color: '#6366f1' },
    { id: 'other', name: 'Other', icon: 'more_horiz', color: '#6b7280' }
  ];

  paymentMethods: PaymentMethod[] = [
    { id: 'cash', name: 'Cash', icon: 'payments' },
    { id: 'card', name: 'Card', icon: 'credit_card' },
    { id: 'upi', name: 'UPI', icon: 'qr_code_2' },
    { id: 'bank_transfer', name: 'Bank', icon: 'account_balance' }
  ];

  expense: any = {
    title: '',
    category: 'other',
    amount: null,
    date: new Date(),
    paymentMethod: 'cash',
    vendor: '',
    description: ''
  };

  constructor(
    public dialogRef: MatDialogRef<ExpenseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient
  ) {
    if (data) {
      this.expense = { ...data };
    }
  }

  getSelectedCategory(): ExpenseCategory | undefined {
    return this.categories.find(c => c.id === this.expense.category);
  }

  getPaymentIcon(): string {
    return this.paymentMethods.find(m => m.id === this.expense.paymentMethod)?.icon || 'payments';
  }

  getPaymentName(): string {
    return this.paymentMethods.find(m => m.id === this.expense.paymentMethod)?.name || 'Cash';
  }

  isValid(): boolean {
    return !!(this.expense.title && this.expense.category && this.expense.amount > 0);
  }

  save() {
    this.saving = true;
    const url = this.data 
      ? `${environment.apiUrl}/expenses/${this.data._id}`
      : `${environment.apiUrl}/expenses`;
    
    const method = this.data ? 'put' : 'post';
    
    this.http[method](url, this.expense).subscribe({
      next: () => {
        this.saving = false;
        this.dialogRef.close(true);
      },
      error: (err: any) => {
        this.saving = false;
        alert(err.error?.message || 'Error saving expense');
      }
    });
  }
}
