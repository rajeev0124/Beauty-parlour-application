import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Staff } from '../../core/models/staff.model';
import { StaffService } from '../../core/services/staff.service';

@Component({
  selector: 'app-staff-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatSlideToggleModule,
    MatIconModule,
    MatSnackBarModule
  ],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="staff-dialog">
      <!-- Header -->
      <div class="sd-header">
        <div class="sd-header-icon">
          <mat-icon>{{ data ? 'edit_note' : 'person_add' }}</mat-icon>
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
            <label class="sd-label">Full Name <span class="required">*</span></label>
            <div class="sd-input-wrapper" [class.error]="form.get('name')?.invalid && form.get('name')?.touched" [class.focused]="nameFocused">
              <mat-icon class="input-icon">person</mat-icon>
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
            <label class="sd-label">Role <span class="required">*</span></label>
            <div class="sd-input-wrapper" [class.error]="form.get('role')?.invalid && form.get('role')?.touched" [class.focused]="roleFocused">
              <mat-icon class="input-icon">work</mat-icon>
              <select 
                formControlName="role"
                (focus)="roleFocused = true"
                (blur)="roleFocused = false">
                <option value="" disabled selected>Select role</option>
                <option value="Senior Stylist">Senior Stylist</option>
                <option value="Junior Stylist">Junior Stylist</option>
                <option value="Skin Specialist">Skin Specialist</option>
                <option value="Massage Therapist">Massage Therapist</option>
                <option value="Nail Technician">Nail Technician</option>
                <option value="Bridal Expert">Bridal Expert</option>
                <option value="Manager">Manager</option>
              </select>
              <mat-icon class="select-arrow">expand_more</mat-icon>
            </div>
            @if (form.get('role')?.hasError('required') && form.get('role')?.touched) {
              <span class="sd-error">
                <mat-icon>error</mat-icon>
                Role is required
              </span>
            }
          </div>

          <!-- Two Column Row (responsive) -->
          <div class="sd-row">
            <!-- Phone Field -->
            <div class="sd-field">
              <label class="sd-label">Phone <span class="required">*</span></label>
              <div class="sd-input-wrapper" [class.error]="form.get('phone')?.invalid && form.get('phone')?.touched" [class.focused]="phoneFocused">
                <mat-icon class="input-icon">phone</mat-icon>
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
              <label class="sd-label">Email</label>
              <div class="sd-input-wrapper" [class.focused]="emailFocused">
                <mat-icon class="input-icon">mail</mat-icon>
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
            <label class="sd-label">Specialization</label>
            <div class="sd-input-wrapper" [class.focused]="specFocused">
              <mat-icon class="input-icon">auto_awesome</mat-icon>
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
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
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
        letter-spacing: -0.01em;
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
        transform: scale(1.05);
      }
    }

    // ========== BODY ==========
    .sd-body {
      padding: 24px;
      max-height: 65vh;
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
      gap: 6px;
    }

    .sd-label {
      font-size: 13px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 2px;

      .required {
        color: #ef4444;
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

      input, select {
        flex: 1;
        width: 100%;
        padding: 14px 16px 14px 10px;
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

    .sd-hint {
      font-size: 12px;
      color: #6b7280;
      margin-top: 2px;
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
      margin-top: 4px;
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
      flex-shrink: 0;

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
      justify-content: center;
      gap: 8px;
      padding: 12px 24px;
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
          box-shadow: none;
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
        max-height: 60vh;
      }

      .sd-row {
        grid-template-columns: 1fr;
        gap: 20px;
      }

      .sd-input-wrapper input, 
      .sd-input-wrapper select {
        padding: 12px 14px 12px 10px;
      }

      .sd-toggle-field {
        padding: 14px;
      }

      .sd-footer {
        padding: 16px 20px;
        flex-direction: column-reverse;
        gap: 10px;
      }

      .sd-btn {
        width: 100%;
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
  roleFocused = false;
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
