import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Product } from '../../core/models/product.model';
import { ProductService } from '../../core/services/product.service';

@Component({
  selector: 'app-product-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatFormFieldModule,
    MatInputModule, MatSelectModule,
    MatSlideToggleModule, MatIconModule, MatSnackBarModule
  ],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="product-dialog">
      <!-- Header -->
      <div class="pd-header">
        <div class="pd-header-icon">
          <mat-icon>{{ data ? 'edit' : 'add_shopping_cart' }}</mat-icon>
        </div>
        <div class="pd-header-text">
          <h2>{{ data ? 'Edit Product' : 'Add New Product' }}</h2>
          <p>{{ data ? 'Update product details' : 'Fill in the product information' }}</p>
        </div>
        <button class="pd-close-btn" (click)="dialogRef.close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Body -->
      <div class="pd-body">
        <form [formGroup]="form" class="pd-form">
          <!-- Product Name -->
          <div class="pd-field">
            <label class="pd-label">
              <mat-icon>inventory_2</mat-icon>
              Product Name <span class="required">*</span>
            </label>
            <div class="pd-input-wrapper" [class.error]="form.get('name')?.invalid && form.get('name')?.touched" [class.focused]="nameFocused">
              <input 
                type="text" 
                formControlName="name" 
                placeholder="Enter product name"
                (focus)="nameFocused = true"
                (blur)="nameFocused = false">
            </div>
            @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
              <span class="pd-error">
                <mat-icon>error</mat-icon>
                Product name is required
              </span>
            }
          </div>

          <!-- Category -->
          <div class="pd-field">
            <label class="pd-label">
              <mat-icon>category</mat-icon>
              Category <span class="required">*</span>
            </label>
            <mat-form-field appearance="outline" class="pd-select">
              <mat-select formControlName="category" placeholder="Select category">
                <mat-option value="skin">
                  <span class="cat-option">🧴 Skin Care</span>
                </mat-option>
                <mat-option value="hair">
                  <span class="cat-option">💇 Hair Care</span>
                </mat-option>
                <mat-option value="nails">
                  <span class="cat-option">💅 Nail Care</span>
                </mat-option>
                <mat-option value="makeup">
                  <span class="cat-option">💄 Makeup</span>
                </mat-option>
                <mat-option value="body">
                  <span class="cat-option">🧖 Body Care</span>
                </mat-option>
                <mat-option value="fragrance">
                  <span class="cat-option">🌸 Fragrance</span>
                </mat-option>
                <mat-option value="tools">
                  <span class="cat-option">✂️ Tools</span>
                </mat-option>
                <mat-option value="accessories">
                  <span class="cat-option">💎 Accessories</span>
                </mat-option>
              </mat-select>
            </mat-form-field>
            @if (form.get('category')?.hasError('required') && form.get('category')?.touched) {
              <span class="pd-error">
                <mat-icon>error</mat-icon>
                Category is required
              </span>
            }
          </div>

          <!-- Price & Stock Row -->
          <div class="pd-row">
            <!-- Price -->
            <div class="pd-field">
              <label class="pd-label">
                <mat-icon>currency_rupee</mat-icon>
                Price <span class="required">*</span>
              </label>
              <div class="pd-input-wrapper price-input" [class.error]="form.get('price')?.invalid && form.get('price')?.touched" [class.focused]="priceFocused">
                <span class="currency-symbol">₹</span>
                <input 
                  type="number" 
                  formControlName="price" 
                  placeholder="0"
                  (focus)="priceFocused = true"
                  (blur)="priceFocused = false">
              </div>
              @if (form.get('price')?.invalid && form.get('price')?.touched) {
                <span class="pd-error">
                  <mat-icon>error</mat-icon>
                  Valid price required
                </span>
              }
            </div>

            <!-- Stock -->
            <div class="pd-field">
              <label class="pd-label">
                <mat-icon>inventory</mat-icon>
                Stock Quantity <span class="required">*</span>
              </label>
              <div class="pd-input-wrapper stock-input" [class.error]="form.get('stock')?.invalid && form.get('stock')?.touched" [class.focused]="stockFocused">
                <input 
                  type="number" 
                  formControlName="stock" 
                  placeholder="0"
                  (focus)="stockFocused = true"
                  (blur)="stockFocused = false">
                <span class="unit-label">units</span>
              </div>
              @if (form.get('stock')?.invalid && form.get('stock')?.touched) {
                <span class="pd-error">
                  <mat-icon>error</mat-icon>
                  Valid stock required
                </span>
              }
            </div>
          </div>

          <!-- Description -->
          <div class="pd-field">
            <label class="pd-label">
              <mat-icon>description</mat-icon>
              Description
            </label>
            <div class="pd-textarea-wrapper" [class.focused]="descFocused">
              <textarea 
                formControlName="description" 
                placeholder="Enter product description (optional)"
                rows="3"
                (focus)="descFocused = true"
                (blur)="descFocused = false"></textarea>
            </div>
            <span class="pd-hint">Brief description of the product features and benefits</span>
          </div>

          <!-- Image URL -->
          <div class="pd-field">
            <label class="pd-label">
              <mat-icon>image</mat-icon>
              Product Image URL
            </label>
            <div class="pd-input-wrapper" [class.focused]="imageFocused">
              <input 
                type="url" 
                formControlName="image" 
                placeholder="https://example.com/product-image.jpg"
                (focus)="imageFocused = true"
                (blur)="imageFocused = false"
                (input)="onImageUrlChange()">
            </div>
            <span class="pd-hint">Enter the URL of the product image</span>
            @if (imagePreview) {
              <div class="pd-image-preview">
                <img [src]="imagePreview" alt="Product preview" (error)="imagePreview = ''">
              </div>
            }
          </div>

          <!-- Status Toggle -->
          <div class="pd-toggle-field">
            <div class="pd-toggle-info">
              <div class="pd-toggle-icon" [class.active]="form.get('isActive')?.value">
                <mat-icon>{{ form.get('isActive')?.value ? 'check_circle' : 'cancel' }}</mat-icon>
              </div>
              <div class="pd-toggle-text">
                <span class="pd-toggle-label">Product Status</span>
                <span class="pd-toggle-desc">{{ form.get('isActive')?.value ? 'Product is visible and available for sale' : 'Product is hidden from catalog' }}</span>
              </div>
            </div>
            <mat-slide-toggle formControlName="isActive" color="primary"></mat-slide-toggle>
          </div>
        </form>
      </div>

      <!-- Footer -->
      <div class="pd-footer">
        <button class="pd-btn cancel" (click)="dialogRef.close()">
          <mat-icon>close</mat-icon>
          Cancel
        </button>
        <button class="pd-btn submit" (click)="save()" [disabled]="form.invalid">
          <mat-icon>{{ data ? 'save' : 'add' }}</mat-icon>
          {{ data ? 'Save Changes' : 'Add Product' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .cdk-overlay-pane:has(.product-dialog) {
      max-width: 95vw !important;
    }

    .mat-mdc-dialog-container:has(.product-dialog) {
      --mdc-dialog-container-shape: 20px;
      padding: 0 !important;
    }

    .product-dialog {
      width: 540px;
      max-width: 100%;
      background: #fff;
      border-radius: 20px;
      overflow: hidden;
    }

    // ========== HEADER ==========
    .pd-header {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 24px;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      position: relative;
    }

    .pd-header-icon {
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

    .pd-header-text {
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

    .pd-close-btn {
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
    .pd-body {
      padding: 24px;
      max-height: 60vh;
      overflow-y: auto;
    }

    .pd-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .pd-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    // ========== FIELD ==========
    .pd-field {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .pd-label {
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
        color: #f59e0b;
      }

      .required {
        color: #ef4444;
      }
    }

    .pd-input-wrapper {
      position: relative;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      background: #f9fafb;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;

      &.focused {
        border-color: #f59e0b;
        background: #fff;
        box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.1);
      }

      &.error {
        border-color: #ef4444;
        background: #fef2f2;
      }

      input {
        flex: 1;
        padding: 14px 16px;
        border: none;
        background: transparent;
        font-size: 14px;
        color: #1f2937;
        outline: none;
        box-sizing: border-box;
        min-width: 0;

        &::placeholder {
          color: #9ca3af;
        }

        &[type="number"] {
          -moz-appearance: textfield;
          &::-webkit-outer-spin-button,
          &::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
        }
      }

      &.price-input {
        .currency-symbol {
          padding-left: 16px;
          font-size: 16px;
          font-weight: 600;
          color: #6b7280;
        }
        input {
          padding-left: 8px;
        }
      }

      &.stock-input {
        .unit-label {
          padding-right: 16px;
          font-size: 13px;
          color: #9ca3af;
        }
      }
    }

    .pd-textarea-wrapper {
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      background: #f9fafb;
      transition: all 0.2s ease;

      &.focused {
        border-color: #f59e0b;
        background: #fff;
        box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.1);
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

    .pd-error {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #ef4444;

      mat-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
      }
    }

    .pd-hint {
      font-size: 12px;
      color: #6b7280;
    }

    .pd-image-preview {
      margin-top: 12px;
      border-radius: 12px;
      overflow: hidden;
      border: 2px solid #e5e7eb;
      background: #f9fafb;
      
      img {
        width: 100%;
        height: 150px;
        object-fit: cover;
        display: block;
      }
    }

    // ========== SELECT ==========
    .pd-select {
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
        border-color: #f59e0b !important;
      }

      .mat-mdc-select-trigger {
        padding: 4px 0;
      }

      .mat-mdc-form-field-infix {
        padding: 12px 0 !important;
        min-height: auto !important;
      }
    }

    .cat-option {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
    }

    // ========== TOGGLE ==========
    .pd-toggle-field {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      gap: 16px;
    }

    .pd-toggle-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .pd-toggle-icon {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fee2e2;
      transition: all 0.2s ease;

      mat-icon {
        font-size: 22px;
        width: 22px;
        height: 22px;
        color: #dc2626;
      }

      &.active {
        background: #d1fae5;

        mat-icon {
          color: #059669;
        }
      }
    }

    .pd-toggle-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .pd-toggle-label {
      font-size: 14px;
      font-weight: 600;
      color: #1f2937;
    }

    .pd-toggle-desc {
      font-size: 12px;
      color: #6b7280;
    }

    // ========== FOOTER ==========
    .pd-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 20px 24px;
      background: #f9fafb;
      border-top: 1px solid #f3f4f6;
    }

    .pd-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      border: none;
      border-radius: 10px;
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
        background: linear-gradient(135deg, #f59e0b, #d97706);
        color: #fff;
        box-shadow: 0 4px 14px rgba(245, 158, 11, 0.3);

        &:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }
      }
    }

    // ========== RESPONSIVE ==========
    @media (max-width: 600px) {
      .product-dialog {
        width: 100%;
        border-radius: 16px;
      }

      .pd-header {
        padding: 20px;
        gap: 12px;
      }

      .pd-header-icon {
        width: 44px;
        height: 44px;

        mat-icon {
          font-size: 22px;
          width: 22px;
          height: 22px;
        }
      }

      .pd-header-text h2 {
        font-size: 18px;
      }

      .pd-close-btn {
        top: 12px;
        right: 12px;
        width: 32px;
        height: 32px;
      }

      .pd-body {
        padding: 20px;
        max-height: 55vh;
      }

      .pd-row {
        grid-template-columns: 1fr;
        gap: 20px;
      }

      .pd-input-wrapper input {
        padding: 12px 14px;
      }

      .pd-toggle-field {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }

      .pd-footer {
        padding: 16px 20px;
        flex-direction: column-reverse;
      }

      .pd-btn {
        width: 100%;
        justify-content: center;
        padding: 14px 24px;
      }
    }

    @media (max-width: 400px) {
      .pd-header {
        padding: 16px;
      }

      .pd-header-icon {
        width: 40px;
        height: 40px;

        mat-icon {
          font-size: 20px;
          width: 20px;
          height: 20px;
        }
      }

      .pd-header-text {
        h2 { font-size: 16px; }
        p { font-size: 12px; }
      }

      .pd-body {
        padding: 16px;
      }

      .pd-form {
        gap: 16px;
      }

      .pd-toggle-icon {
        width: 36px;
        height: 36px;

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }
      }

      .pd-toggle-label { font-size: 13px; }
      .pd-toggle-desc { font-size: 11px; }
    }
  `]
})
export class ProductDialogComponent {
  form: FormGroup;
  nameFocused = false;
  priceFocused = false;
  stockFocused = false;
  descFocused = false;
  imageFocused = false;
  imagePreview: string = '';

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    public dialogRef: MatDialogRef<ProductDialogComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: Product | null
  ) {
    this.form = this.fb.group({
      name: [data?.name || '', Validators.required],
      category: [data?.category || '', Validators.required],
      price: [data?.price || '', [Validators.required, Validators.min(0)]],
      stock: [data?.stock || 0, [Validators.required, Validators.min(0)]],
      description: [data?.description || ''],
      image: [data?.image || ''],
      isActive: [data?.isActive ?? true]
    });
    
    this.imagePreview = data?.image || '';
  }

  onImageUrlChange(): void {
    this.imagePreview = this.form.get('image')?.value || '';
  }

  save(): void {
    if (this.form.invalid) return;

    const obs = this.data
      ? this.productService.update(this.data._id, this.form.value)
      : this.productService.create(this.form.value);

    obs.subscribe({
      next: () => {
        this.snackBar.open('Product ' + (this.data ? 'updated' : 'created'), 'Close', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: () => this.snackBar.open('Operation failed', 'Close', { duration: 3000 })
    });
  }
}
