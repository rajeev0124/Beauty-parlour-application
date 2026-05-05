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
      <!-- Header -->
      <div class="dialog-header">
        <div class="header-icon">
          <mat-icon>{{ data ? 'edit' : 'add_card' }}</mat-icon>
        </div>
        <div class="header-text">
          <h2>{{ data ? 'Edit Expense' : 'Add New Expense' }}</h2>
          <p>{{ data ? 'Update expense details' : 'Record a new business expense' }}</p>
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
            Category
          </label>
          <div class="category-grid">
            @for (cat of categories; track cat.id) {
              <button 
                type="button"
                class="category-btn" 
                [class.active]="expense.category === cat.id"
                [style.--cat-color]="cat.color"
                (click)="expense.category = cat.id">
                <mat-icon>{{ cat.icon }}</mat-icon>
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
          <div class="input-wrapper">
            <input 
              type="text" 
              [(ngModel)]="expense.title" 
              placeholder="e.g., Monthly Electricity Bill"
              class="form-input">
          </div>
        </div>

        <!-- Amount & Date Row -->
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">
              <mat-icon>currency_rupee</mat-icon>
              Amount <span class="required">*</span>
            </label>
            <div class="input-wrapper amount-input">
              <span class="currency-symbol">₹</span>
              <input 
                type="number" 
                [(ngModel)]="expense.amount" 
                placeholder="0.00"
                min="0"
                class="form-input">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">
              <mat-icon>calendar_today</mat-icon>
              Date
            </label>
            <div class="input-wrapper date-input">
              <input 
                matInput 
                [matDatepicker]="picker" 
                [(ngModel)]="expense.date"
                placeholder="Select date"
                class="form-input">
              <mat-datepicker-toggle [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
            </div>
          </div>
        </div>

        <!-- Payment Method -->
        <div class="form-group">
          <label class="form-label">
            <mat-icon>payments</mat-icon>
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

        <!-- Vendor -->
        <div class="form-group">
          <label class="form-label">
            <mat-icon>store</mat-icon>
            Vendor / Payee
            <span class="optional">(Optional)</span>
          </label>
          <div class="input-wrapper">
            <input 
              type="text" 
              [(ngModel)]="expense.vendor" 
              placeholder="e.g., ABC Suppliers"
              class="form-input">
          </div>
        </div>

        <!-- Description -->
        <div class="form-group">
          <label class="form-label">
            <mat-icon>notes</mat-icon>
            Description
            <span class="optional">(Optional)</span>
          </label>
          <div class="input-wrapper">
            <textarea 
              [(ngModel)]="expense.description" 
              placeholder="Add any additional notes about this expense..."
              rows="2"
              class="form-input textarea"></textarea>
          </div>
        </div>

        <!-- Preview Card -->
        <div class="preview-card" [style.--preview-color]="getSelectedCategory()?.color || '#10b981'">
          <div class="preview-left">
            <div class="preview-icon">
              <mat-icon>{{ getSelectedCategory()?.icon || 'receipt' }}</mat-icon>
            </div>
            <div class="preview-info">
              <span class="preview-title">{{ expense.title || 'Expense Title' }}</span>
              <div class="preview-meta">
                <span class="preview-category">{{ getSelectedCategory()?.name || 'Category' }}</span>
                <span class="preview-date">{{ expense.date | date:'mediumDate' }}</span>
                <span class="preview-payment">
                  <mat-icon>{{ getPaymentIcon() }}</mat-icon>
                  {{ getPaymentName() }}
                </span>
              </div>
            </div>
          </div>
          <div class="preview-amount">
            <span class="amount-value">₹{{ expense.amount | number:'1.0-0' }}</span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="dialog-actions">
        <button class="btn-secondary" (click)="dialogRef.close()">
          Cancel
        </button>
        <button class="btn-primary" (click)="save()" [disabled]="!isValid() || saving">
          @if (saving) {
            <span class="spinner"></span>
            Saving...
          } @else {
            <mat-icon>{{ data ? 'check' : 'add' }}</mat-icon>
            {{ data ? 'Update Expense' : 'Add Expense' }}
          }
        </button>
      </div>
    </div>
  `,
  styles: [`
    .expense-dialog {
      width: 560px;
      max-width: 95vw;
      display: flex;
      flex-direction: column;
      background: white;
      border-radius: 16px;
      overflow: hidden;
    }

    // Header
    .dialog-header {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 18px 20px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      flex-shrink: 0;
    }

    .header-icon {
      width: 44px;
      height: 44px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;

      mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
    }

    .header-text {
      flex: 1;

      h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }

      p {
        margin: 2px 0 0;
        font-size: 13px;
        opacity: 0.9;
      }
    }

    .close-btn {
      width: 34px;
      height: 34px;
      background: rgba(255, 255, 255, 0.15);
      border: none;
      border-radius: 8px;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.25);
      }

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    // Body
    .dialog-body {
      padding: 20px;
      overflow-y: auto;
      max-height: calc(80vh - 140px);
    }

    // Form Groups
    .form-group {
      margin-bottom: 16px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .form-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      font-weight: 600;
      color: #475569;
      margin-bottom: 8px;

      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
        color: #94a3b8;
      }

      .required {
        color: #ef4444;
      }

      .optional {
        font-weight: 400;
        color: #94a3b8;
        font-size: 11px;
      }
    }

    .input-wrapper {
      position: relative;

      &.amount-input {
        .currency-symbol {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #10b981;
          font-weight: 600;
          font-size: 15px;
        }

        .form-input {
          padding-left: 28px;
        }
      }

      &.date-input {
        .form-input {
          padding-right: 36px;
        }

        .mat-datepicker-toggle {
          position: absolute;
          right: 2px;
          top: 50%;
          transform: translateY(-50%);
          --mat-datepicker-toggle-icon-color: #94a3b8;
        }
      }
    }

    .form-input {
      width: 100%;
      padding: 10px 12px;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 14px;
      color: #1e293b;
      background: #f8fafc;
      transition: all 0.2s ease;
      outline: none;
      font-family: inherit;
      box-sizing: border-box;

      &::placeholder {
        color: #94a3b8;
      }

      &:hover {
        border-color: #cbd5e1;
      }

      &:focus {
        border-color: #10b981;
        background: white;
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
      }

      &.textarea {
        resize: vertical;
        min-height: 60px;
      }
    }

    // Category Grid
    .category-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
    }

    .category-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 10px 6px;
      background: #f8fafc;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        color: #64748b;
      }

      span {
        font-size: 10px;
        font-weight: 500;
        color: #64748b;
        text-align: center;
        line-height: 1.2;
      }

      &:hover {
        border-color: #cbd5e1;
        background: #f1f5f9;
      }

      &.active {
        border-color: var(--cat-color, #10b981);
        background: color-mix(in srgb, var(--cat-color, #10b981) 10%, white);

        mat-icon {
          color: var(--cat-color, #10b981);
        }

        span {
          color: var(--cat-color, #10b981);
          font-weight: 600;
        }
      }
    }

    // Payment Grid
    .payment-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
    }

    .payment-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 10px 6px;
      background: #f8fafc;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        color: #64748b;
      }

      span {
        font-size: 10px;
        font-weight: 500;
        color: #64748b;
      }

      &:hover {
        border-color: #cbd5e1;
      }

      &.active {
        border-color: #10b981;
        background: rgba(16, 185, 129, 0.08);

        mat-icon, span {
          color: #10b981;
        }

        span {
          font-weight: 600;
        }
      }
    }

    // Preview Card
    .preview-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 14px 16px;
      background: linear-gradient(135deg, color-mix(in srgb, var(--preview-color) 8%, white) 0%, color-mix(in srgb, var(--preview-color) 4%, white) 100%);
      border: 1px solid color-mix(in srgb, var(--preview-color) 20%, #e2e8f0);
      border-radius: 12px;
      margin-top: 8px;
    }

    .preview-left {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
      flex: 1;
    }

    .preview-icon {
      width: 40px;
      height: 40px;
      background: var(--preview-color);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        color: white;
      }
    }

    .preview-info {
      min-width: 0;
      flex: 1;

      .preview-title {
        display: block;
        font-size: 14px;
        font-weight: 600;
        color: #1e293b;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-bottom: 4px;
      }

      .preview-meta {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }

      .preview-category {
        font-size: 11px;
        font-weight: 600;
        color: var(--preview-color);
        background: color-mix(in srgb, var(--preview-color) 15%, white);
        padding: 2px 8px;
        border-radius: 4px;
      }

      .preview-date {
        font-size: 11px;
        color: #64748b;
      }

      .preview-payment {
        display: flex;
        align-items: center;
        gap: 3px;
        font-size: 11px;
        color: #64748b;

        mat-icon {
          font-size: 12px;
          width: 12px;
          height: 12px;
        }
      }
    }

    .preview-amount {
      flex-shrink: 0;

      .amount-value {
        font-size: 20px;
        font-weight: 700;
        color: #dc2626;
      }
    }

    // Actions
    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding: 14px 20px;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      flex-shrink: 0;
    }

    .btn-primary {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 10px 20px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .btn-secondary {
      padding: 10px 18px;
      background: white;
      color: #64748b;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        border-color: #cbd5e1;
        background: #f8fafc;
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

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    // Responsive
    @media (max-width: 600px) {
      .expense-dialog {
        width: 100%;
        max-width: 100%;
        border-radius: 16px 16px 0 0;
      }

      .dialog-body {
        max-height: calc(85vh - 140px);
        padding: 16px;
      }

      .form-row {
        grid-template-columns: 1fr;
        gap: 12px;
      }

      .category-grid {
        grid-template-columns: repeat(4, 1fr);
        gap: 6px;
      }

      .category-btn {
        padding: 8px 4px;

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }

        span {
          font-size: 9px;
        }
      }

      .payment-grid {
        grid-template-columns: repeat(4, 1fr);
        gap: 6px;
      }

      .payment-btn {
        padding: 8px 4px;

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }

        span {
          font-size: 9px;
        }
      }

      .preview-card {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
      }

      .preview-left {
        width: 100%;
      }

      .preview-amount {
        width: 100%;
        text-align: right;
        padding-top: 8px;
        border-top: 1px dashed #e2e8f0;
      }

      .dialog-actions {
        padding: 12px 16px;
      }

      .btn-primary, .btn-secondary {
        padding: 10px 16px;
        font-size: 13px;
      }
    }
  `],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExpenseDialogComponent {
  saving = false;
  
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
    amount: 0,
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
    return this.expense.title && this.expense.category && this.expense.amount > 0;
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
      error: (err) => {
        this.saving = false;
        alert(err.error?.message || 'Error saving expense');
      }
    });
  }
}
