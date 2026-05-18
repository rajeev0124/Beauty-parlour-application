import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Product } from '../../core/models/product.model';
import { ProductService } from '../../core/services/product.service';

@Component({
  selector: 'app-product-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSlideToggleModule,
    MatIconModule,
    MatSnackBarModule
  ],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="product-dialog" [class.edit-mode]="data">
      <!-- Decorative shimmer bar -->
      <div class="dialog-accent-bar"></div>

      <!-- Header -->
      <div class="sd-header">
        <div class="sd-header-icon" [class.edit]="data">
          <mat-icon>{{ data ? 'edit_note' : 'add_shopping_cart' }}</mat-icon>
        </div>
        <div class="sd-header-text">
          <h2>{{ data ? 'Edit Product' : 'Add New Product' }}</h2>
          <p>{{ data ? 'Update product details' : 'Fill in the product information' }}</p>
        </div>
        <button type="button" class="sd-close-btn" (click)="dialogRef.close()" aria-label="Close">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Body -->
      <div class="sd-body">
        <form [formGroup]="form" class="sd-form">
          <!-- Product Name -->
          <div class="sd-field">
            <label class="sd-label">Product Name <span class="required">*</span></label>
            <div class="sd-input-wrapper" [class.error]="form.get('name')?.invalid && form.get('name')?.touched" [class.focused]="nameFocused">
              <mat-icon class="input-icon">inventory_2</mat-icon>
              <input 
                type="text" 
                formControlName="name" 
                placeholder="Enter product name"
                (focus)="nameFocused = true"
                (blur)="nameFocused = false">
            </div>
            @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
              <span class="sd-error">
                <mat-icon>error</mat-icon>
                Product name is required
              </span>
            }
          </div>

          <!-- Category -->
          <div class="sd-field">
            <label class="sd-label">Category <span class="required">*</span></label>
            <div class="sd-input-wrapper" [class.error]="form.get('category')?.invalid && form.get('category')?.touched" [class.focused]="categoryFocused">
              <mat-icon class="input-icon">category</mat-icon>
              <select 
                formControlName="category"
                (focus)="categoryFocused = true"
                (blur)="categoryFocused = false">
                <option value="" disabled>Select category</option>
                <option value="skin">🧴 Skin Care</option>
                <option value="hair">💇 Hair Care</option>
                <option value="nails">💅 Nail Care</option>
                <option value="makeup">💄 Makeup</option>
                <option value="body">🧖 Body Care</option>
                <option value="fragrance">🌸 Fragrance</option>
                <option value="tools">✂️ Tools</option>
                <option value="accessories">💎 Accessories</option>
              </select>
              <mat-icon class="select-arrow">expand_more</mat-icon>
            </div>
            @if (form.get('category')?.hasError('required') && form.get('category')?.touched) {
              <span class="sd-error">
                <mat-icon>error</mat-icon>
                Category is required
              </span>
            }
          </div>

          <!-- Price & Stock Grid -->
          <div class="sd-row">
            <!-- Price -->
            <div class="sd-field">
              <label class="sd-label">Price <span class="required">*</span></label>
              <div class="sd-input-wrapper" [class.error]="form.get('price')?.invalid && form.get('price')?.touched" [class.focused]="priceFocused">
                <mat-icon class="input-icon">currency_rupee</mat-icon>
                <input 
                  type="number" 
                  formControlName="price" 
                  placeholder="0"
                  (focus)="priceFocused = true"
                  (blur)="priceFocused = false">
              </div>
              @if (form.get('price')?.invalid && form.get('price')?.touched) {
                <span class="sd-error">
                  <mat-icon>error</mat-icon>
                  Valid price is required
                </span>
              }
            </div>

            <!-- Stock -->
            <div class="sd-field">
              <label class="sd-label">Stock Quantity <span class="required">*</span></label>
              <div class="sd-input-wrapper" [class.error]="form.get('stock')?.invalid && form.get('stock')?.touched" [class.focused]="stockFocused">
                <mat-icon class="input-icon">inventory</mat-icon>
                <input 
                  type="number" 
                  formControlName="stock" 
                  placeholder="0"
                  (focus)="stockFocused = true"
                  (blur)="stockFocused = false">
                <span class="input-suffix">units</span>
              </div>
              @if (form.get('stock')?.invalid && form.get('stock')?.touched) {
                <span class="sd-error">
                  <mat-icon>error</mat-icon>
                  Valid stock is required
                </span>
              }
            </div>
          </div>

          <!-- Description -->
          <div class="sd-field">
            <label class="sd-label">Description <span class="optional">(Optional)</span></label>
            <div class="sd-input-wrapper textarea" [class.focused]="descFocused">
              <mat-icon class="input-icon">description</mat-icon>
              <textarea 
                formControlName="description" 
                rows="3" 
                placeholder="Enter product description..."
                (focus)="descFocused = true"
                (blur)="descFocused = false"></textarea>
            </div>
            <span class="sd-hint-text">Brief description of the product features and benefits</span>
          </div>

          <!-- Image URL -->
          <div class="sd-field">
            <label class="sd-label">Product Image URL <span class="optional">(Optional)</span></label>
            <div class="sd-input-wrapper" [class.focused]="imageFocused">
              <mat-icon class="input-icon">image</mat-icon>
              <input 
                type="url" 
                formControlName="image" 
                placeholder="https://example.com/product-image.jpg"
                (focus)="imageFocused = true"
                (blur)="imageFocused = false"
                (input)="onImageUrlChange()">
            </div>
            <span class="sd-hint-text">Provide a valid image web link for the product card</span>
            @if (imagePreview) {
              <div class="pd-image-preview">
                <img [src]="imagePreview" alt="Product preview" (error)="imagePreview = ''">
              </div>
            }
          </div>

          <!-- Status Toggle -->
          <div class="sd-toggle-field">
            <div class="sd-toggle-info">
              <div class="sd-toggle-icon" [class.available]="form.get('isActive')?.value">
                <mat-icon>{{ form.get('isActive')?.value ? 'visibility' : 'visibility_off' }}</mat-icon>
              </div>
              <div class="sd-toggle-text">
                <span class="sd-toggle-label">Product Status</span>
                <span class="sd-toggle-desc">{{ form.get('isActive')?.value ? 'Product is visible and available for sale' : 'Product is hidden from catalog' }}</span>
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
        <button type="button" class="sd-btn submit" (click)="save()" [disabled]="form.invalid">
          <mat-icon>{{ data ? 'save' : 'add_circle' }}</mat-icon>
          <span>{{ data ? 'Save Changes' : 'Add Product' }}</span>
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
      background: transparent !important;
      box-shadow: none !important;
    }

    .mat-mdc-dialog-container:has(.product-dialog) .mdc-dialog__surface {
      background: transparent !important;
      box-shadow: none !important;
      border-radius: 20px !important;
      overflow: visible !important;
    }

    .product-dialog {
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
      background: linear-gradient(90deg, #f59e0b, #eab308, #f59e0b);
      background-size: 200% 100%;
      animation: shimmer 2s linear infinite;
    }

    .product-dialog.edit-mode .dialog-accent-bar {
      background: linear-gradient(90deg, #d97706, #f59e0b, #d97706);
      background-size: 200% 100%;
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

      &.edit {
        background: linear-gradient(135deg, #d97706, #b45309);
        box-shadow: 0 4px 12px rgba(217, 119, 6, 0.25);
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

      &.textarea {
        align-items: flex-start;
        
        .input-icon {
          margin-top: 13px;
        }
      }
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

    .sd-hint-text {
      font-size: 11px;
      color: #6b7280;
      margin-top: 1px;
    }

    .pd-image-preview {
      margin-top: 8px;
      border-radius: 12px;
      overflow: hidden;
      border: 2px solid #e5e7eb;
      background: #f9fafb;
      
      img {
        width: 100%;
        height: 140px;
        object-fit: cover;
        display: block;
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
          box-shadow: none;
        }
      }
    }

    // ========== RESPONSIVE ==========
    @media (max-width: 600px) {
      .product-dialog {
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
export class ProductDialogComponent {
  form: FormGroup;
  nameFocused = false;
  priceFocused = false;
  stockFocused = false;
  descFocused = false;
  imageFocused = false;
  categoryFocused = false;
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
