import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
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
    CommonModule, FormsModule, MatDialogModule, MatFormFieldModule, 
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatSnackBarModule
  ],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="add-stock-dialog">
      <!-- Header -->
      <div class="asd-header">
        <div class="asd-header-icon">
          <mat-icon>add_shopping_cart</mat-icon>
        </div>
        <div class="asd-header-text">
          <h2>Add Stock</h2>
          <p>Increase inventory for a product</p>
        </div>
        <button class="asd-close-btn" (click)="dialogRef.close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Body -->
      <div class="asd-body">
        <!-- Product Selection -->
        <div class="asd-field">
          <label class="asd-label">
            <mat-icon>inventory_2</mat-icon>
            Select Product <span class="required">*</span>
          </label>
          <div class="asd-select-wrap">
            <mat-form-field appearance="outline" class="asd-select">
              <mat-select [(ngModel)]="selectedProduct" placeholder="Choose a product" (selectionChange)="onProductChange()">
                @for (product of data.products; track product._id) {
                  <mat-option [value]="product._id">
                    <div class="product-option">
                      <span class="product-name">{{ product.name }}</span>
                      <span class="product-stock" [class.low]="product.stock <= 10" [class.out]="product.stock === 0">
                        {{ product.stock }} in stock
                      </span>
                    </div>
                  </mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>
        </div>

        <!-- Selected Product Preview -->
        @if (selectedProductData) {
          <div class="asd-preview">
            <div class="preview-avatar" [style.background]="getCategoryGradient(selectedProductData.category)">
              @if (selectedProductData.image) {
                <img [src]="selectedProductData.image" [alt]="selectedProductData.name">
              } @else {
                <span>{{ getCategoryIcon(selectedProductData.category) }}</span>
              }
            </div>
            <div class="preview-info">
              <span class="preview-name">{{ selectedProductData.name }}</span>
              <div class="preview-stock">
                <span class="current">Current: <strong>{{ selectedProductData.stock }}</strong></span>
                <mat-icon>arrow_forward</mat-icon>
                <span class="new">New: <strong>{{ selectedProductData.stock + quantity }}</strong></span>
              </div>
            </div>
          </div>
        }

        <!-- Quantity Input -->
        <div class="asd-field">
          <label class="asd-label">
            <mat-icon>add_circle</mat-icon>
            Quantity to Add <span class="required">*</span>
          </label>
          <div class="asd-quantity">
            <button class="qty-btn minus" (click)="decreaseQty()" [disabled]="quantity <= 1">
              <mat-icon>remove</mat-icon>
            </button>
            <div class="qty-input-wrap" [class.focused]="qtyFocused">
              <input 
                type="number" 
                [(ngModel)]="quantity" 
                min="1" 
                max="9999"
                (focus)="qtyFocused = true"
                (blur)="qtyFocused = false">
              <span class="qty-unit">units</span>
            </div>
            <button class="qty-btn plus" (click)="increaseQty()">
              <mat-icon>add</mat-icon>
            </button>
          </div>
          <div class="qty-presets">
            <button class="preset-btn" (click)="quantity = 5" [class.active]="quantity === 5">+5</button>
            <button class="preset-btn" (click)="quantity = 10" [class.active]="quantity === 10">+10</button>
            <button class="preset-btn" (click)="quantity = 25" [class.active]="quantity === 25">+25</button>
            <button class="preset-btn" (click)="quantity = 50" [class.active]="quantity === 50">+50</button>
            <button class="preset-btn" (click)="quantity = 100" [class.active]="quantity === 100">+100</button>
          </div>
        </div>

        <!-- Notes (Optional) -->
        <div class="asd-field">
          <label class="asd-label">
            <mat-icon>notes</mat-icon>
            Notes <span class="optional">(optional)</span>
          </label>
          <div class="asd-textarea-wrap" [class.focused]="notesFocused">
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
      <div class="asd-footer">
        <button class="asd-btn cancel" (click)="dialogRef.close()">
          <mat-icon>close</mat-icon>
          Cancel
        </button>
        <button class="asd-btn submit" (click)="addStock()" [disabled]="!selectedProduct || !quantity || loading">
          @if (loading) {
            <div class="btn-spinner"></div>
            Adding...
          } @else {
            <mat-icon>add</mat-icon>
            Add Stock
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
    }

    .add-stock-dialog {
      width: 480px;
      max-width: 100%;
      background: #fff;
      border-radius: 20px;
      overflow: hidden;
    }

    // ========== HEADER ==========
    .asd-header {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 24px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      position: relative;
    }

    .asd-header-icon {
      width: 52px;
      height: 52px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      mat-icon {
        font-size: 26px;
        width: 26px;
        height: 26px;
        color: #fff;
      }
    }

    .asd-header-text {
      flex: 1;

      h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 700;
        color: #fff;
      }

      p {
        margin: 4px 0 0;
        font-size: 13px;
        color: rgba(255, 255, 255, 0.85);
      }
    }

    .asd-close-btn {
      position: absolute;
      top: 16px;
      right: 16px;
      width: 36px;
      height: 36px;
      border: none;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        color: #fff;
      }

      &:hover {
        background: rgba(255, 255, 255, 0.25);
      }
    }

    // ========== BODY ==========
    .asd-body {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      max-height: 60vh;
      overflow-y: auto;
    }

    .asd-field {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .asd-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 600;
      color: #374151;

      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
        color: #10b981;
      }

      .required {
        color: #ef4444;
      }

      .optional {
        color: #9ca3af;
        font-weight: 400;
      }
    }

    // ========== SELECT ==========
    .asd-select-wrap {
      width: 100%;
    }

    .asd-select {
      width: 100%;

      .mat-mdc-form-field-subscript-wrapper {
        display: none;
      }

      .mdc-notched-outline__leading,
      .mdc-notched-outline__notch,
      .mdc-notched-outline__trailing {
        border-color: #e5e7eb !important;
        border-width: 2px !important;
      }

      .mdc-notched-outline__leading {
        border-radius: 12px 0 0 12px !important;
      }

      .mdc-notched-outline__trailing {
        border-radius: 0 12px 12px 0 !important;
      }

      &.mat-focused .mdc-notched-outline__leading,
      &.mat-focused .mdc-notched-outline__notch,
      &.mat-focused .mdc-notched-outline__trailing {
        border-color: #10b981 !important;
      }

      .mat-mdc-form-field-infix {
        padding: 14px 0 !important;
        min-height: auto !important;
      }
    }

    .product-option {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      gap: 12px;

      .product-name {
        font-weight: 500;
      }

      .product-stock {
        font-size: 12px;
        padding: 2px 8px;
        border-radius: 12px;
        background: #d1fae5;
        color: #059669;

        &.low {
          background: #fef3c7;
          color: #d97706;
        }

        &.out {
          background: #fee2e2;
          color: #dc2626;
        }
      }
    }

    // ========== PREVIEW ==========
    .asd-preview {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 16px;
      background: #f9fafb;
      border-radius: 14px;
      border: 1px solid #e5e7eb;
    }

    .preview-avatar {
      width: 50px;
      height: 50px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      flex-shrink: 0;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .preview-info {
      flex: 1;

      .preview-name {
        display: block;
        font-weight: 600;
        color: #1f2937;
        margin-bottom: 6px;
      }

      .preview-stock {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;

        .current {
          color: #6b7280;
        }

        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
          color: #10b981;
        }

        .new {
          color: #059669;

          strong {
            color: #10b981;
          }
        }
      }
    }

    // ========== QUANTITY ==========
    .asd-quantity {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .qty-btn {
      width: 48px;
      height: 48px;
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
        font-size: 22px;
        width: 22px;
        height: 22px;
        color: #6b7280;
      }

      &.plus {
        &:hover {
          border-color: #10b981;
          background: #ecfdf5;

          mat-icon { color: #059669; }
        }
      }

      &.minus {
        &:hover:not(:disabled) {
          border-color: #ef4444;
          background: #fef2f2;

          mat-icon { color: #dc2626; }
        }
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .qty-input-wrap {
      flex: 1;
      display: flex;
      align-items: center;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      background: #f9fafb;
      padding: 0 16px;
      height: 48px;
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
        font-size: 18px;
        font-weight: 600;
        color: #1f2937;
        text-align: center;
        outline: none;
        min-width: 60px;

        &::-webkit-outer-spin-button,
        &::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        -moz-appearance: textfield;
      }

      .qty-unit {
        font-size: 13px;
        color: #9ca3af;
        margin-left: 8px;
      }
    }

    .qty-presets {
      display: flex;
      gap: 8px;
      margin-top: 8px;
    }

    .preset-btn {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      background: #fff;
      font-size: 13px;
      font-weight: 600;
      color: #6b7280;
      cursor: pointer;
      transition: all 0.15s ease;

      &:hover {
        border-color: #10b981;
        color: #059669;
      }

      &.active {
        border-color: #10b981;
        background: #ecfdf5;
        color: #059669;
      }
    }

    // ========== TEXTAREA ==========
    .asd-textarea-wrap {
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      background: #f9fafb;
      transition: all 0.2s ease;

      &.focused {
        border-color: #10b981;
        background: #fff;
        box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
      }

      textarea {
        width: 100%;
        padding: 14px 16px;
        border: none;
        background: transparent;
        font-size: 14px;
        color: #1f2937;
        outline: none;
        resize: none;
        font-family: inherit;
        box-sizing: border-box;

        &::placeholder {
          color: #9ca3af;
        }
      }
    }

    // ========== FOOTER ==========
    .asd-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 20px 24px;
      background: #f9fafb;
      border-top: 1px solid #f3f4f6;
    }

    .asd-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      border: none;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;

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
        box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);

        &:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.45);
        }

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .btn-spinner {
          width: 18px;
          height: 18px;
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

      .asd-header {
        padding: 20px;
        gap: 12px;
      }

      .asd-header-icon {
        width: 44px;
        height: 44px;

        mat-icon {
          font-size: 22px;
          width: 22px;
          height: 22px;
        }
      }

      .asd-header-text h2 {
        font-size: 18px;
      }

      .asd-close-btn {
        top: 12px;
        right: 12px;
        width: 32px;
        height: 32px;
      }

      .asd-body {
        padding: 20px;
        gap: 16px;
      }

      .qty-btn {
        width: 44px;
        height: 44px;
      }

      .qty-input-wrap {
        height: 44px;

        input {
          font-size: 16px;
        }
      }

      .qty-presets {
        flex-wrap: wrap;
      }

      .preset-btn {
        min-width: calc(33.33% - 6px);
        flex: 0 0 auto;
      }

      .asd-footer {
        padding: 16px 20px;
        flex-direction: column-reverse;
      }

      .asd-btn {
        width: 100%;
        justify-content: center;
        padding: 14px 24px;
      }
    }

    @media (max-width: 380px) {
      .asd-header {
        padding: 16px;
      }

      .asd-header-icon {
        width: 40px;
        height: 40px;

        mat-icon {
          font-size: 20px;
          width: 20px;
          height: 20px;
        }
      }

      .asd-header-text {
        h2 { font-size: 16px; }
        p { font-size: 12px; }
      }

      .asd-body {
        padding: 16px;
      }

      .asd-quantity {
        gap: 8px;
      }

      .qty-btn {
        width: 40px;
        height: 40px;

        mat-icon {
          font-size: 20px;
          width: 20px;
          height: 20px;
        }
      }

      .qty-input-wrap {
        height: 40px;
        padding: 0 12px;
      }

      .preset-btn {
        padding: 6px 8px;
        font-size: 12px;
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
