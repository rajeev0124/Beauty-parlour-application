import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Service } from '../../core/models/service.model';
import { ServiceService } from '../../core/services/service.service';

@Component({
  selector: 'app-service-dialog',
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
    <div class="service-dialog">
      <!-- Decorative Shimmer Accent Bar -->
      <div class="dialog-accent-bar"></div>

      <!-- Header -->
      <div class="sd-header">
        <div class="sd-header-icon" [class.edit]="data">
          <mat-icon>{{ data ? 'edit_note' : 'spa' }}</mat-icon>
        </div>
        <div class="sd-header-text">
          <h2>{{ data ? 'Edit Service' : 'New Service' }}</h2>
          <p>{{ data ? 'Update service details' : 'Add a new service to your catalog' }}</p>
        </div>
        <button type="button" class="sd-close-btn" (click)="dialogRef.close()" aria-label="Close">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Body -->
      <div class="sd-body">
        <form [formGroup]="form" class="sd-form">
          <!-- Service Name -->
          <div class="sd-field">
            <label class="sd-label">Service Name <span class="required">*</span></label>
            <div class="sd-input-wrapper" [class.error]="form.get('name')?.invalid && form.get('name')?.touched" [class.focused]="nameFocused">
              <mat-icon class="input-icon">badge</mat-icon>
              <input 
                type="text" 
                formControlName="name" 
                placeholder="e.g. Hair Cut, Facial, Manicure"
                (focus)="nameFocused = true"
                (blur)="nameFocused = false">
            </div>
            @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
              <span class="sd-error">
                <mat-icon>error</mat-icon>
                Service name is required
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
                <option value="" disabled selected>Select category</option>
                <option value="hair">Hair Services</option>
                <option value="skin">Skin & Facial</option>
                <option value="nails">Nails & Manicures</option>
                <option value="makeup">Professional Makeup</option>
                <option value="spa">Spa & Massage</option>
                <option value="other">Other</option>
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

          <!-- Price & Duration Row -->
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
                  Valid price required
                </span>
              }
            </div>

            <!-- Duration -->
            <div class="sd-field">
              <label class="sd-label">Duration <span class="required">*</span></label>
              <div class="sd-input-wrapper" [class.error]="form.get('duration')?.invalid && form.get('duration')?.touched" [class.focused]="durationFocused">
                <mat-icon class="input-icon">timer</mat-icon>
                <input 
                  type="number" 
                  formControlName="duration" 
                  placeholder="30"
                  (focus)="durationFocused = true"
                  (blur)="durationFocused = false">
                <span class="input-suffix">min</span>
              </div>
              @if (form.get('duration')?.invalid && form.get('duration')?.touched) {
                <span class="sd-error">
                  <mat-icon>error</mat-icon>
                  Valid duration required
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
                placeholder="Brief description of the service..."
                (focus)="descFocused = true"
                (blur)="descFocused = false"></textarea>
            </div>
          </div>

          <!-- Active Toggle -->
          <div class="sd-toggle-field">
            <div class="sd-toggle-info">
              <div class="sd-toggle-icon" [class.available]="form.get('isActive')?.value">
                <mat-icon>{{ form.get('isActive')?.value ? 'visibility' : 'visibility_off' }}</mat-icon>
              </div>
              <div class="sd-toggle-text">
                <span class="sd-toggle-label">Service Status</span>
                <span class="sd-toggle-desc">{{ form.get('isActive')?.value ? 'Visible to customers' : 'Hidden from catalog' }}</span>
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
          <span>{{ data ? 'Save Changes' : 'Create Service' }}</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .cdk-overlay-pane:has(.service-dialog) {
      max-width: 95vw !important;
    }

    .mat-mdc-dialog-container:has(.service-dialog) {
      --mdc-dialog-container-shape: 20px;
      padding: 0 !important;
    }

    .service-dialog {
      width: 480px;
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
      background: linear-gradient(90deg, #7c3aed, #ec4899, #7c3aed);
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
      background: linear-gradient(135deg, #fdfaff 0%, #fff 100%);
      border-bottom: 1px solid #f6f3ff;
      position: relative;
    }

    .sd-header-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #7c3aed, #ec4899);
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
        background: linear-gradient(135deg, #3b82f6, #2563eb);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
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
        border-color: #7c3aed;
        background: #fff;
        box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.1);
        
        .input-icon {
          color: #7c3aed;
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
        background: linear-gradient(135deg, #7c3aed, #ec4899);
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
      .service-dialog {
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
export class ServiceDialogComponent {
  form: FormGroup;
  saving = false;

  nameFocused = false;
  categoryFocused = false;
  priceFocused = false;
  durationFocused = false;
  descFocused = false;

  constructor(
    private fb: FormBuilder,
    private serviceService: ServiceService,
    public dialogRef: MatDialogRef<ServiceDialogComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: Service | null
  ) {
    this.form = this.fb.group({
      name: [data?.name || '', Validators.required],
      category: [data?.category || '', Validators.required],
      price: [data?.price || '', [Validators.required, Validators.min(0)]],
      duration: [data?.duration || '', [Validators.required, Validators.min(1)]],
      description: [data?.description || ''],
      isActive: [data?.isActive ?? true]
    });
  }

  save(): void {
    if (this.form.invalid) return;

    this.saving = true;

    // Ensure proper types before sending
    const formData = {
      ...this.form.value,
      price: Number(this.form.value.price),
      duration: Number(this.form.value.duration),
      description: this.form.value.description || ''
    };

    console.log('Sending service data:', formData);

    const obs = this.data
      ? this.serviceService.update(this.data._id, formData)
      : this.serviceService.create(formData);

    obs.subscribe({
      next: (res) => {
        console.log('Service saved successfully:', res);
        this.snackBar.open('Service ' + (this.data ? 'updated' : 'created'), 'Close', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Service operation failed:', err);
        this.saving = false;
        const errorMsg = err.error?.message || err.message || 'Operation failed';
        this.snackBar.open(errorMsg, 'Close', { duration: 5000 });
      }
    });
  }
}
