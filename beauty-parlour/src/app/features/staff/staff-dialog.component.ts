import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Staff } from '../../core/models/staff.model';
import { StaffService } from '../../core/services/staff.service';

@Component({
  selector: 'app-staff-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatFormFieldModule,
    MatInputModule, MatSelectModule,
    MatSlideToggleModule, MatIconModule, MatSnackBarModule
  ],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="staff-dialog">
      <!-- Header -->
      <div class="sd-header">
        <div class="sd-header-icon">
          <mat-icon>{{ data ? 'edit' : 'person_add' }}</mat-icon>
        </div>
        <div class="sd-header-text">
          <h2>{{ data ? 'Edit Staff Member' : 'Add New Staff' }}</h2>
          <p>{{ data ? 'Update team member details' : 'Fill in the details below' }}</p>
        </div>
        <button class="sd-close-btn" (click)="dialogRef.close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Body -->
      <div class="sd-body">
        <form [formGroup]="form" class="sd-form">
          <!-- Name Field -->
          <div class="sd-field">
            <label class="sd-label">
              <mat-icon>person</mat-icon>
              Full Name <span class="required">*</span>
            </label>
            <div class="sd-input-wrapper" [class.error]="form.get('name')?.invalid && form.get('name')?.touched" [class.focused]="nameFocused">
              <input 
                type="text" 
                formControlName="name" 
                placeholder="Enter staff name"
                (focus)="nameFocused = true"
                (blur)="nameFocused = false">
            </div>
            @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
              <span class="sd-error">
                <mat-icon>error</mat-icon>
                Name is required
              </span>
            }
          </div>

          <!-- Role Field -->
          <div class="sd-field">
            <label class="sd-label">
              <mat-icon>work</mat-icon>
              Role <span class="required">*</span>
            </label>
            <mat-form-field appearance="outline" class="sd-select">
              <mat-select formControlName="role" placeholder="Select role">
                <mat-option value="Senior Stylist">
                  <mat-icon>star</mat-icon> Senior Stylist
                </mat-option>
                <mat-option value="Junior Stylist">
                  <mat-icon>content_cut</mat-icon> Junior Stylist
                </mat-option>
                <mat-option value="Skin Specialist">
                  <mat-icon>spa</mat-icon> Skin Specialist
                </mat-option>
                <mat-option value="Massage Therapist">
                  <mat-icon>self_improvement</mat-icon> Massage Therapist
                </mat-option>
                <mat-option value="Nail Technician">
                  <mat-icon>brush</mat-icon> Nail Technician
                </mat-option>
                <mat-option value="Bridal Expert">
                  <mat-icon>favorite</mat-icon> Bridal Expert
                </mat-option>
                <mat-option value="Manager">
                  <mat-icon>admin_panel_settings</mat-icon> Manager
                </mat-option>
              </mat-select>
            </mat-form-field>
            @if (form.get('role')?.hasError('required') && form.get('role')?.touched) {
              <span class="sd-error">
                <mat-icon>error</mat-icon>
                Role is required
              </span>
            }
          </div>

          <!-- Two Column Row -->
          <div class="sd-row">
            <!-- Phone Field -->
            <div class="sd-field">
              <label class="sd-label">
                <mat-icon>phone</mat-icon>
                Phone <span class="required">*</span>
              </label>
              <div class="sd-input-wrapper" [class.error]="form.get('phone')?.invalid && form.get('phone')?.touched" [class.focused]="phoneFocused">
                <input 
                  type="tel" 
                  formControlName="phone" 
                  placeholder="Enter phone number"
                  (focus)="phoneFocused = true"
                  (blur)="phoneFocused = false">
              </div>
              @if (form.get('phone')?.hasError('required') && form.get('phone')?.touched) {
                <span class="sd-error">
                  <mat-icon>error</mat-icon>
                  Phone is required
                </span>
              }
            </div>

            <!-- Email Field -->
            <div class="sd-field">
              <label class="sd-label">
                <mat-icon>email</mat-icon>
                Email
              </label>
              <div class="sd-input-wrapper" [class.focused]="emailFocused">
                <input 
                  type="email" 
                  formControlName="email" 
                  placeholder="Enter email address"
                  (focus)="emailFocused = true"
                  (blur)="emailFocused = false">
              </div>
            </div>
          </div>

          <!-- Specialization Field -->
          <div class="sd-field">
            <label class="sd-label">
              <mat-icon>auto_awesome</mat-icon>
              Specialization
            </label>
            <div class="sd-input-wrapper" [class.focused]="specFocused">
              <input 
                type="text" 
                formControlName="specialization" 
                placeholder="e.g. Hair Coloring, Bridal Makeup"
                (focus)="specFocused = true"
                (blur)="specFocused = false">
            </div>
            <span class="sd-hint">What is this staff member's area of expertise?</span>
          </div>

          <!-- Availability Toggle -->
          <div class="sd-toggle-field">
            <div class="sd-toggle-info">
              <div class="sd-toggle-icon" [class.available]="form.get('availability')?.value">
                <mat-icon>{{ form.get('availability')?.value ? 'check_circle' : 'cancel' }}</mat-icon>
              </div>
              <div class="sd-toggle-text">
                <span class="sd-toggle-label">Availability Status</span>
                <span class="sd-toggle-desc">{{ form.get('availability')?.value ? 'Available for appointments' : 'Not available for appointments' }}</span>
              </div>
            </div>
            <mat-slide-toggle formControlName="availability" color="primary"></mat-slide-toggle>
          </div>
        </form>
      </div>

      <!-- Footer -->
      <div class="sd-footer">
        <button class="sd-btn cancel" (click)="dialogRef.close()">
          <mat-icon>close</mat-icon>
          Cancel
        </button>
        <button class="sd-btn submit" (click)="save()" [disabled]="form.invalid">
          <mat-icon>{{ data ? 'save' : 'person_add' }}</mat-icon>
          {{ data ? 'Save Changes' : 'Add Staff' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .cdk-overlay-pane:has(.staff-dialog) {
      max-width: 95vw !important;
    }

    .mat-mdc-dialog-container:has(.staff-dialog) {
      --mdc-dialog-container-shape: 20px;
      padding: 0 !important;
    }

    .staff-dialog {
      width: 520px;
      max-width: 100%;
      background: #fff;
      border-radius: 20px;
      overflow: hidden;
    }

    // ========== HEADER ==========
    .sd-header {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 24px;
      background: linear-gradient(135deg, #7c3aed 0%, #9333ea 100%);
      position: relative;
    }

    .sd-header-icon {
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

    .sd-header-text {
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

    .sd-close-btn {
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
    .sd-body {
      padding: 24px;
      max-height: 60vh;
      overflow-y: auto;
    }

    .sd-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
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
      gap: 8px;
    }

    .sd-label {
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
        color: #7c3aed;
      }

      .required {
        color: #ef4444;
      }
    }

    .sd-input-wrapper {
      position: relative;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      background: #f9fafb;
      transition: all 0.2s ease;

      &.focused {
        border-color: #7c3aed;
        background: #fff;
        box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.1);
      }

      &.error {
        border-color: #ef4444;
        background: #fef2f2;
      }

      input {
        width: 100%;
        padding: 14px 16px;
        border: none;
        background: transparent;
        font-size: 14px;
        color: #1f2937;
        outline: none;
        box-sizing: border-box;

        &::placeholder {
          color: #9ca3af;
        }
      }
    }

    .sd-error {
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

    .sd-hint {
      font-size: 12px;
      color: #6b7280;
    }

    // ========== SELECT ==========
    .sd-select {
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
        border-color: #7c3aed !important;
      }

      .mat-mdc-select-trigger {
        padding: 4px 0;
      }

      .mat-mdc-form-field-infix {
        padding: 12px 0 !important;
        min-height: auto !important;
      }
    }

    // ========== TOGGLE ==========
    .sd-toggle-field {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      gap: 16px;
    }

    .sd-toggle-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .sd-toggle-icon {
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
      font-size: 14px;
      font-weight: 600;
      color: #1f2937;
    }

    .sd-toggle-desc {
      font-size: 12px;
      color: #6b7280;
    }

    // ========== FOOTER ==========
    .sd-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 20px 24px;
      background: #f9fafb;
      border-top: 1px solid #f3f4f6;
    }

    .sd-btn {
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
        background: linear-gradient(135deg, #7c3aed, #9333ea);
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
        }
      }
    }

    // ========== RESPONSIVE ==========
    @media (max-width: 600px) {
      .staff-dialog {
        width: 100%;
        border-radius: 16px;
      }

      .sd-header {
        padding: 20px;
        gap: 12px;
      }

      .sd-header-icon {
        width: 44px;
        height: 44px;

        mat-icon {
          font-size: 22px;
          width: 22px;
          height: 22px;
        }
      }

      .sd-header-text h2 {
        font-size: 18px;
      }

      .sd-close-btn {
        top: 12px;
        right: 12px;
        width: 32px;
        height: 32px;
      }

      .sd-body {
        padding: 20px;
        max-height: 55vh;
      }

      .sd-row {
        grid-template-columns: 1fr;
        gap: 20px;
      }

      .sd-input-wrapper input {
        padding: 12px 14px;
      }

      .sd-toggle-field {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }

      .sd-footer {
        padding: 16px 20px;
        flex-direction: column-reverse;
      }

      .sd-btn {
        width: 100%;
        justify-content: center;
        padding: 14px 24px;
      }
    }

    @media (max-width: 400px) {
      .sd-header {
        padding: 16px;
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

      .sd-header-text {
        h2 { font-size: 16px; }
        p { font-size: 12px; }
      }

      .sd-body {
        padding: 16px;
      }

      .sd-form {
        gap: 16px;
      }

      .sd-toggle-icon {
        width: 36px;
        height: 36px;

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }
      }

      .sd-toggle-label { font-size: 13px; }
      .sd-toggle-desc { font-size: 11px; }
    }
  `]
})
export class StaffDialogComponent {
  form: FormGroup;
  nameFocused = false;
  phoneFocused = false;
  emailFocused = false;
  specFocused = false;

  constructor(
    private fb: FormBuilder,
    private staffService: StaffService,
    public dialogRef: MatDialogRef<StaffDialogComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: Staff | null
  ) {
    this.form = this.fb.group({
      name: [data?.name || '', Validators.required],
      role: [data?.role || '', Validators.required],
      phone: [data?.phone || '', Validators.required],
      email: [data?.email || ''],
      specialization: [data?.specialization || ''],
      availability: [data?.availability ?? true]
    });
  }

  save(): void {
    if (this.form.invalid) return;

    const obs = this.data
      ? this.staffService.update(this.data._id, this.form.value)
      : this.staffService.create(this.form.value);

    obs.subscribe({
      next: () => {
        this.snackBar.open('Staff ' + (this.data ? 'updated' : 'created'), 'Close', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: () => this.snackBar.open('Operation failed', 'Close', { duration: 3000 })
    });
  }
}
