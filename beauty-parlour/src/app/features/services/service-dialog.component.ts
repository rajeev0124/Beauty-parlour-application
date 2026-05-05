import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
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
    ReactiveFormsModule, MatFormFieldModule,
    MatInputModule, MatSelectModule,
    MatSlideToggleModule, MatIconModule, MatSnackBarModule
  ],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="premium-service-dialog">
      <!-- Accent Bar -->
      <div class="psd-accent"></div>
      
      <!-- Header -->
      <div class="psd-header">
        <div class="psd-header-content">
          <div class="psd-icon" [class.edit]="data">
            <mat-icon>{{ data ? 'edit' : 'spa' }}</mat-icon>
          </div>
          <div class="psd-titles">
            <h2>{{ data ? 'Edit Service' : 'New Service' }}</h2>
            <p>{{ data ? 'Update service details' : 'Add a new service to your catalog' }}</p>
          </div>
        </div>
        <button type="button" class="psd-close" (click)="dialogRef.close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Body -->
      <div class="psd-body">
        <form [formGroup]="form" class="psd-form">
          
          <!-- Service Name -->
          <div class="psd-card">
            <div class="psd-card-header">
              <div class="psd-card-icon name"><mat-icon>badge</mat-icon></div>
              <span class="psd-card-title">Service Name</span>
              <span class="psd-required">*</span>
            </div>
            <mat-form-field appearance="outline" class="psd-field">
              <input matInput formControlName="name" placeholder="e.g. Hair Cut, Facial, Manicure">
              @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
                <mat-error>Service name is required</mat-error>
              }
            </mat-form-field>
          </div>

          <!-- Category -->
          <div class="psd-card">
            <div class="psd-card-header">
              <div class="psd-card-icon category"><mat-icon>category</mat-icon></div>
              <span class="psd-card-title">Category</span>
              <span class="psd-required">*</span>
            </div>
            <mat-form-field appearance="outline" class="psd-field">
              <mat-select formControlName="category" placeholder="Select category">
                <mat-option value="hair">
                  <div class="psd-option"><mat-icon>content_cut</mat-icon><span>Hair</span></div>
                </mat-option>
                <mat-option value="skin">
                  <div class="psd-option"><mat-icon>face</mat-icon><span>Skin</span></div>
                </mat-option>
                <mat-option value="nails">
                  <div class="psd-option"><mat-icon>back_hand</mat-icon><span>Nails</span></div>
                </mat-option>
                <mat-option value="makeup">
                  <div class="psd-option"><mat-icon>brush</mat-icon><span>Makeup</span></div>
                </mat-option>
                <mat-option value="spa">
                  <div class="psd-option"><mat-icon>spa</mat-icon><span>Spa</span></div>
                </mat-option>
                <mat-option value="other">
                  <div class="psd-option"><mat-icon>more_horiz</mat-icon><span>Other</span></div>
                </mat-option>
              </mat-select>
              @if (form.get('category')?.hasError('required') && form.get('category')?.touched) {
                <mat-error>Category is required</mat-error>
              }
            </mat-form-field>
          </div>

          <!-- Price & Duration Row -->
          <div class="psd-grid">
            <div class="psd-card">
              <div class="psd-card-header">
                <div class="psd-card-icon price"><mat-icon>currency_rupee</mat-icon></div>
                <span class="psd-card-title">Price</span>
                <span class="psd-required">*</span>
              </div>
              <mat-form-field appearance="outline" class="psd-field">
                <span matPrefix class="psd-prefix">₹</span>
                <input matInput formControlName="price" type="number" placeholder="0">
                @if (form.get('price')?.invalid && form.get('price')?.touched) {
                  <mat-error>Valid price required</mat-error>
                }
              </mat-form-field>
            </div>
            
            <div class="psd-card">
              <div class="psd-card-header">
                <div class="psd-card-icon duration"><mat-icon>timer</mat-icon></div>
                <span class="psd-card-title">Duration</span>
                <span class="psd-required">*</span>
              </div>
              <mat-form-field appearance="outline" class="psd-field">
                <input matInput formControlName="duration" type="number" placeholder="30">
                <span matSuffix class="psd-suffix">min</span>
                @if (form.get('duration')?.invalid && form.get('duration')?.touched) {
                  <mat-error>Valid duration required</mat-error>
                }
              </mat-form-field>
            </div>
          </div>

          <!-- Description -->
          <div class="psd-card desc-card">
            <div class="psd-card-header">
              <div class="psd-card-icon desc"><mat-icon>description</mat-icon></div>
              <span class="psd-card-title">Description</span>
              <span class="psd-optional">(Optional)</span>
            </div>
            <mat-form-field appearance="outline" class="psd-field textarea">
              <textarea matInput formControlName="description" rows="2" 
                        placeholder="Brief description of the service..."></textarea>
            </mat-form-field>
          </div>

          <!-- Active Toggle -->
          <div class="psd-toggle-row">
            <div class="psd-toggle-info">
              <mat-icon [class.active]="form.get('isActive')?.value">{{ form.get('isActive')?.value ? 'visibility' : 'visibility_off' }}</mat-icon>
              <div class="psd-toggle-text">
                <span class="label">Service Status</span>
                <span class="hint">{{ form.get('isActive')?.value ? 'Visible to customers' : 'Hidden from catalog' }}</span>
              </div>
            </div>
            <mat-slide-toggle formControlName="isActive" color="primary"></mat-slide-toggle>
          </div>

        </form>
      </div>

      <!-- Footer -->
      <div class="psd-footer">
        <button type="button" class="psd-btn cancel" (click)="dialogRef.close()">
          Cancel
        </button>
        <button type="button" class="psd-btn submit" (click)="save()" [disabled]="form.invalid || saving">
          @if (saving) {
            <span class="psd-spinner"></span>
          } @else {
            <mat-icon>{{ data ? 'save' : 'add_circle' }}</mat-icon>
          }
          <span>{{ data ? 'Save Changes' : 'Create Service' }}</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    /* ========== PREMIUM SERVICE DIALOG ========== */
    .premium-service-dialog {
      display: flex;
      flex-direction: column;
      width: 100%;
      max-width: 440px;
      background: #fff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }

    .psd-accent {
      height: 4px;
      background: linear-gradient(90deg, #7c3aed, #ec4899, #7c3aed);
      background-size: 200% 100%;
      animation: shimmer 2s linear infinite;
    }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    /* Header */
    .psd-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding: 16px 20px;
      background: linear-gradient(135deg, #faf5ff 0%, #fff 100%);
      border-bottom: 1px solid #f3e8ff;
    }

    .psd-header-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .psd-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: linear-gradient(135deg, #7c3aed, #9333ea);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 14px rgba(124, 58, 237, 0.35);
    }

    .psd-icon.edit {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      box-shadow: 0 4px 14px rgba(59, 130, 246, 0.35);
    }

    .psd-icon mat-icon {
      color: #fff;
      font-size: 22px;
      width: 22px;
      height: 22px;
    }

    .psd-titles {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .psd-titles h2 {
      margin: 0;
      font-size: 17px;
      font-weight: 700;
      color: #1f2937;
      letter-spacing: -0.01em;
    }

    .psd-titles p {
      margin: 0;
      font-size: 12px;
      color: #6b7280;
    }

    .psd-close {
      width: 32px;
      height: 32px;
      border: none;
      background: rgba(0,0,0,0.04);
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #9ca3af;
      transition: all 0.15s ease;
    }

    .psd-close:hover {
      background: rgba(0,0,0,0.08);
      color: #374151;
    }

    .psd-close mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    /* Body */
    .psd-body {
      padding: 16px 20px;
      flex: 1;
      overflow-y: auto;
      max-height: 60vh;
    }

    .psd-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    /* Cards */
    .psd-card {
      background: #fafafa;
      border: 1px solid #f0f0f0;
      border-radius: 10px;
      padding: 12px;
      transition: all 0.15s ease;
    }

    .psd-card:focus-within {
      background: #fff;
      border-color: #e9d5ff;
      box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.08);
    }

    .psd-card-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .psd-card-icon {
      width: 24px;
      height: 24px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .psd-card-icon mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    .psd-card-icon.name { background: #dbeafe; }
    .psd-card-icon.name mat-icon { color: #2563eb; }
    .psd-card-icon.category { background: #fce7f3; }
    .psd-card-icon.category mat-icon { color: #db2777; }
    .psd-card-icon.price { background: #d1fae5; }
    .psd-card-icon.price mat-icon { color: #059669; }
    .psd-card-icon.duration { background: #fef3c7; }
    .psd-card-icon.duration mat-icon { color: #d97706; }
    .psd-card-icon.desc { background: #e0e7ff; }
    .psd-card-icon.desc mat-icon { color: #4f46e5; }

    .psd-card-title {
      font-size: 11px;
      font-weight: 600;
      color: #374151;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .psd-required {
      color: #ef4444;
      font-size: 12px;
      font-weight: 600;
    }

    .psd-optional {
      font-size: 10px;
      color: #9ca3af;
      margin-left: auto;
    }

    /* Grid Layout */
    .psd-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    /* Form Fields */
    .psd-field {
      width: 100%;
    }

    .psd-field .mat-mdc-form-field-subscript-wrapper {
      display: none;
    }

    .psd-field.textarea .mat-mdc-form-field-subscript-wrapper {
      display: block;
    }

    .psd-field .mat-mdc-text-field-wrapper {
      background: #fff !important;
      border-radius: 8px !important;
    }

    .psd-field .mdc-notched-outline__leading,
    .psd-field .mdc-notched-outline__notch,
    .psd-field .mdc-notched-outline__trailing {
      border-color: #e5e7eb !important;
    }

    .psd-field.mat-focused .mdc-notched-outline__leading,
    .psd-field.mat-focused .mdc-notched-outline__notch,
    .psd-field.mat-focused .mdc-notched-outline__trailing {
      border-color: #7c3aed !important;
    }

    .psd-field .mat-mdc-form-field-infix {
      min-height: 40px !important;
      padding: 8px 0 !important;
    }

    .psd-field input,
    .psd-field .mat-mdc-select-value,
    .psd-field textarea {
      font-size: 13px !important;
    }

    .psd-prefix, .psd-suffix {
      font-size: 13px;
      color: #6b7280;
      font-weight: 500;
    }

    /* Option styling */
    .psd-option {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .psd-option mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #6b7280;
    }

    /* Toggle Row */
    .psd-toggle-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: linear-gradient(135deg, #f0fdf4, #ecfdf5);
      border: 1px solid #bbf7d0;
      border-radius: 10px;
      padding: 12px 14px;
      margin-top: 4px;
    }

    .psd-toggle-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .psd-toggle-info mat-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
      color: #9ca3af;
      transition: color 0.2s ease;
    }

    .psd-toggle-info mat-icon.active {
      color: #22c55e;
    }

    .psd-toggle-text {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .psd-toggle-text .label {
      font-size: 13px;
      font-weight: 600;
      color: #374151;
    }

    .psd-toggle-text .hint {
      font-size: 11px;
      color: #6b7280;
    }

    /* Footer */
    .psd-footer {
      display: flex;
      gap: 10px;
      padding: 14px 20px;
      background: #f9fafb;
      border-top: 1px solid #f3f4f6;
    }

    .psd-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 11px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
      border: none;
    }

    .psd-btn mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .psd-btn.cancel {
      background: #fff;
      color: #6b7280;
      border: 1px solid #e5e7eb;
    }

    .psd-btn.cancel:hover {
      background: #f9fafb;
      border-color: #d1d5db;
    }

    .psd-btn.submit {
      background: linear-gradient(135deg, #7c3aed, #9333ea);
      color: #fff;
      box-shadow: 0 2px 8px rgba(124, 58, 237, 0.3);
    }

    .psd-btn.submit:hover:not(:disabled) {
      box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4);
      transform: translateY(-1px);
    }

    .psd-btn.submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .psd-spinner {
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

    /* ========== MOBILE RESPONSIVE ========== */
    @media (max-width: 480px) {
      .premium-service-dialog {
        max-width: 100%;
        border-radius: 12px;
      }

      .psd-accent {
        height: 3px;
      }

      .psd-header {
        padding: 12px 14px;
      }

      .psd-icon {
        width: 38px;
        height: 38px;
        border-radius: 10px;
      }

      .psd-icon mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      .psd-titles h2 {
        font-size: 15px;
      }

      .psd-titles p {
        font-size: 11px;
      }

      .psd-close {
        width: 28px;
        height: 28px;
      }

      .psd-close mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }

      .psd-body {
        padding: 12px 14px;
        max-height: 55vh;
      }

      .psd-form {
        gap: 10px;
      }

      .psd-card {
        padding: 10px;
        border-radius: 8px;
      }

      .psd-card-header {
        margin-bottom: 6px;
      }

      .psd-card-icon {
        width: 22px;
        height: 22px;
      }

      .psd-card-icon mat-icon {
        font-size: 12px;
        width: 12px;
        height: 12px;
      }

      .psd-card-title {
        font-size: 10px;
      }

      .psd-grid {
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }

      .psd-field .mat-mdc-form-field-infix {
        min-height: 36px !important;
      }

      .psd-field input,
      .psd-field .mat-mdc-select-value,
      .psd-field textarea {
        font-size: 12px !important;
      }

      .psd-toggle-row {
        padding: 10px 12px;
      }

      .psd-toggle-info mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      .psd-toggle-text .label {
        font-size: 12px;
      }

      .psd-toggle-text .hint {
        font-size: 10px;
      }

      .psd-footer {
        padding: 12px 14px;
        gap: 8px;
      }

      .psd-btn {
        padding: 10px 12px;
        font-size: 12px;
        border-radius: 6px;
      }

      .psd-btn mat-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
      }
    }

    /* Extra small */
    @media (max-width: 360px) {
      .psd-header {
        padding: 10px 12px;
      }

      .psd-icon {
        width: 34px;
        height: 34px;
      }

      .psd-titles h2 {
        font-size: 14px;
      }

      .psd-body {
        padding: 10px 12px;
      }

      .psd-card {
        padding: 8px;
      }

      .psd-grid {
        gap: 8px;
      }

      .psd-footer {
        padding: 10px 12px;
      }

      .psd-btn {
        padding: 8px 10px;
        font-size: 11px;
      }
    }
  `]
})
export class ServiceDialogComponent {
  form: FormGroup;
  saving = false;

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
