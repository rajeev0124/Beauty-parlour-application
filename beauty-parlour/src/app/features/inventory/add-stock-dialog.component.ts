import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface Product {
  _id: string;
  name: string;
  stock: number;
  category?: string;
  image?: string;
}

@Component({
  selector: 'app-add-stock-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatIconModule,
    MatSnackBarModule
  ],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="add-stock-dialog">
      <!-- Decorative shimmer bar -->
      <div class="dialog-accent-bar"></div>

      <!-- Header -->
      <div class="sd-header">
        <div class="sd-header-icon">
          <mat-icon>inventory_2</mat-icon>
        </div>
        <div class="sd-header-text">
          <h2>Add Stock</h2>
          <p>Increase inventory for a product</p>
        </div>
        <button type="button" class="sd-close-btn" (click)="dialogRef.close()" aria-label="Close">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Body -->
      <div class="sd-body">
        <!-- Product Selection -->
        <div class="sd-field">
          <label class="sd-label">Select Product <span class="required">*</span></label>
          <div class="sd-input-wrapper" [class.focused]="productFocused">
            <mat-icon class="input-icon">storefront</mat-icon>
            <select 
              [(ngModel)]="selectedProduct" 
              (change)="onProductChange()" 
              (focus)="productFocused = true"
              (blur)="productFocused = false">
              <option value="" disabled>Choose a product</option>
              @for (product of data.products; track product._id) {
                <option [value]="product._id">
                  {{ product.name }} ({{ product.stock }} in stock)
                </option>
              }
            </select>
            <mat-icon class="select-arrow">expand_more</mat-icon>
          </div>
        </div>

        <!-- Selected Product Preview -->
        @if (selectedProductData) {
          <div class="asd-preview-card">
            <div class="preview-avatar" [style.background]="getCategoryGradient(selectedProductData.category)">
              @if (selectedProductData.image) {
                <img [src]="selectedProductData.image" [alt]="selectedProductData.name" (error)="selectedProductData.image = undefined">
              } @else {
                <span>{{ getCategoryIcon(selectedProductData.category) }}</span>
              }
            </div>
            <div class="preview-info">
              <span class="preview-name">{{ selectedProductData.name }}</span>
              <div class="preview-stock-badge">
                <span class="stock-num current">Current: <strong>{{ selectedProductData.stock }}</strong></span>
                <mat-icon class="stock-arrow-icon">trending_flat</mat-icon>
                <span class="stock-num new">New: <strong>{{ selectedProductData.stock + quantity }}</strong></span>
              </div>
            </div>
          </div>
        }

        <!-- Quantity Input -->
        <div class="sd-field">
          <label class="sd-label">Quantity to Add <span class="required">*</span></label>
          <div class="asd-quantity-control">
            <button type="button" class="qty-btn decrease" (click)="decreaseQty()" [disabled]="quantity <= 1">
              <mat-icon>remove</mat-icon>
            </button>
            <div class="qty-input-wrapper" [class.focused]="qtyFocused">
              <input 
                type="number" 
                [(ngModel)]="quantity" 
                min="1" 
                max="9999"
                (focus)="qtyFocused = true"
                (blur)="qtyFocused = false">
              <span class="qty-suffix">units</span>
            </div>
            <button type="button" class="qty-btn increase" (click)="increaseQty()">
              <mat-icon>add</mat-icon>
            </button>
          </div>
          
          <!-- Preset Fast Badges -->
          <div class="qty-presets">
            <button type="button" class="preset-btn" (click)="quantity = 5" [class.active]="quantity === 5">+5</button>
            <button type="button" class="preset-btn" (click)="quantity = 10" [class.active]="quantity === 10">+10</button>
            <button type="button" class="preset-btn" (click)="quantity = 25" [class.active]="quantity === 25">+25</button>
            <button type="button" class="preset-btn" (click)="quantity = 50" [class.active]="quantity === 50">+50</button>
            <button type="button" class="preset-btn" (click)="quantity = 100" [class.active]="quantity === 100">+100</button>
          </div>
        </div>

        <!-- Notes (Optional) -->
        <div class="sd-field">
          <label class="sd-label">Notes <span class="optional">(Optional)</span></label>
          <div class="sd-input-wrapper textarea" [class.focused]="notesFocused">
            <mat-icon class="input-icon">description</mat-icon>
            <textarea 
              [(ngModel)]="notes" 
              placeholder="Add any notes about this stock addition..."
              rows="2"
              (focus)="notesFocused = true"
              (blur)="notesFocused = false"></textarea>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="sd-footer">
        <button type="button" class="sd-btn cancel" (click)="dialogRef.close()">
          <mat-icon>close</mat-icon>
          Cancel
        </button>
        <button type="button" class="sd-btn submit" (click)="addStock()" [disabled]="!selectedProduct || !quantity || loading">
          @if (loading) {
            <div class="btn-spinner"></div>
            <span>Adding...</span>
          } @else {
            <mat-icon>save</mat-icon>
            <span>Add Stock</span>
          }
        </button>
      </div>
    </div>
  `,
  styles: [`
    .cdk-overlay-pane:has(.add-stock-dialog) {
      max-width: 95vw !important;
    }

    .mat-mdc-dialog-container:has(.add-stock-dialog) {
      --mdc-dialog-container-shape: 20px;
      padding: 0 !important;
      background: transparent !important;
      box-shadow: none !important;
    }

    .mat-mdc-dialog-container:has(.add-stock-dialog) .mdc-dialog__surface {
      background: transparent !important;
      box-shadow: none !important;
      border-radius: 20px !important;
      overflow: visible !important;
    }

    .add-stock-dialog {
      width: 460px;
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
      background: linear-gradient(90deg, #10b981, #34d399, #10b981);
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
      background: linear-gradient(135deg, #ecfdf5 0%, #fff 100%);
      border-bottom: 1px solid #d1fae5;
      position: relative;
    }

    .sd-header-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #10b981, #059669);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);

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
      gap: 18px;
      max-height: 60vh;
      overflow-y: auto;
    }

    .sd-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
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
        border-color: #10b981;
        background: #fff;
        box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
        
        .input-icon {
          color: #10b981;
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

      select, textarea {
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

      &.textarea {
        align-items: flex-start;
        
        .input-icon {
          margin-top: 13px;
        }
      }
    }

    // ========== PREVIEW CARD ==========
    .asd-preview-card {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px;
      background: #f0fdf4;
      border-radius: 12px;
      border: 1.5px dashed #a7f3d0;
    }

    .preview-avatar {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      flex-shrink: 0;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .preview-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .preview-name {
      font-size: 13px;
      font-weight: 700;
      color: #1f2937;
    }

    .preview-stock-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;

      .stock-num {
        font-weight: 500;
        
        strong {
          font-weight: 700;
        }

        &.current {
          color: #6b7280;
        }

        &.new {
          color: #047857;
          
          strong {
            color: #10b981;
          }
        }
      }

      .stock-arrow-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
        color: #10b981;
      }
    }

    // ========== QUANTITY CONTROL ==========
    .asd-quantity-control {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .qty-btn {
      width: 46px;
      height: 46px;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      background: #fff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
      flex-shrink: 0;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        color: #6b7280;
      }

      &.increase:hover {
        border-color: #10b981;
        background: #ecfdf5;
        mat-icon { color: #059669; }
      }

      &.decrease:hover:not(:disabled) {
        border-color: #ef4444;
        background: #fef2f2;
        mat-icon { color: #dc2626; }
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .qty-input-wrapper {
      flex: 1;
      display: flex;
      align-items: center;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      background: #f9fafb;
      padding: 0 16px;
      height: 46px;
      transition: all 0.2s ease;

      &.focused {
        border-color: #10b981;
        background: #fff;
        box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
      }

      input {
        flex: 1;
        border: none;
        background: transparent;
        font-size: 16px;
        font-weight: 700;
        color: #1f2937;
        text-align: center;
        outline: none;
        min-width: 50px;

        &::-webkit-outer-spin-button,
        &::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        -moz-appearance: textfield;
      }

      .qty-suffix {
        font-size: 12px;
        color: #9ca3af;
        margin-left: 6px;
        font-weight: 500;
      }
    }

    .qty-presets {
      display: flex;
      gap: 6px;
      margin-top: 4px;
    }

    .preset-btn {
      flex: 1;
      padding: 8px 10px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      background: #fff;
      font-size: 12px;
      font-weight: 600;
      color: #6b7280;
      cursor: pointer;
      transition: all 0.15s ease;
      font-family: inherit;

      &:hover {
        border-color: #10b981;
        color: #059669;
        background: #ecfdf5;
      }

      &.active {
        border-color: #10b981;
        background: #ecfdf5;
        color: #059669;
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
        background: linear-gradient(135deg, #10b981, #059669);
        color: #fff;
        box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);

        &:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
        }

        &:disabled {
          opacity: 0.5;
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
    @media (max-width: 540px) {
      .add-stock-dialog {
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

      .qty-btn {
        width: 40px;
        height: 40px;
      }

      .qty-input-wrapper {
        height: 40px;
        
        input {
          font-size: 15px;
        }
      }

      .qty-presets {
        flex-wrap: wrap;
      }

      .preset-btn {
        min-width: calc(33.33% - 4px);
        flex: 1 0 auto;
        padding: 6px;
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

    @media (max-width: 380px) {
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

      .asd-quantity-control {
        gap: 8px;
      }

      .qty-btn {
        width: 36px;
        height: 36px;

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }
      }

      .qty-input-wrapper {
        height: 36px;
        padding: 0 10px;
      }

      .preset-btn {
        font-size: 11px;
        padding: 5px;
      }
    }
  `]
})
export class AddStockDialogComponent {
  selectedProduct = '';
  selectedProductData: Product | null = null;
  quantity = 10;
  notes = '';
  loading = false;
  qtyFocused = false;
  notesFocused = false;
  productFocused = false;

  constructor(
    public dialogRef: MatDialogRef<AddStockDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { products: Product[] },
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  onProductChange() {
    this.selectedProductData = this.data.products.find(p => p._id === this.selectedProduct) || null;
  }

  increaseQty() {
    if (this.quantity < 9999) {
      this.quantity++;
    }
  }

  decreaseQty() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  getCategoryIcon(category?: string): string {
    const icons: { [key: string]: string } = {
      'skin': '🧴', 'hair': '💇', 'nails': '💅', 'makeup': '💄',
      'body': '🧖', 'fragrance': '🌸', 'tools': '✂️', 'accessories': '💎'
    };
    return icons[category?.toLowerCase() || ''] || '📦';
  }

  getCategoryGradient(category?: string): string {
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
    return gradients[category?.toLowerCase() || ''] || 'linear-gradient(135deg, #f3f4f6, #e5e7eb)';
  }

  addStock() {
    if (!this.selectedProduct || !this.quantity) return;

    this.loading = true;
    this.http.post(`${environment.apiUrl}/inventory/add-stock`, {
      productId: this.selectedProduct,
      quantity: this.quantity,
      notes: this.notes
    }).subscribe({
      next: () => {
        this.snackBar.open(`Added ${this.quantity} units successfully`, 'Close', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: () => {
        this.snackBar.open('Failed to add stock', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }
}
