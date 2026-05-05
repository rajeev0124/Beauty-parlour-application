import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ScheduleService, Schedule } from '../../core/services/schedule.service';
import { StaffService } from '../../core/services/staff.service';

export interface ScheduleDialogData {
  schedule?: Schedule;
  staffList: any[];
  mode: 'create' | 'edit' | 'leave';
}

@Component({
  selector: 'app-schedule-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSlideToggleModule,
    MatIconModule,
    MatSnackBarModule
  ],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="premium-schedule-dialog" [class.leave-mode]="data.mode === 'leave'">
      <!-- Decorative top bar -->
      <div class="dialog-accent-bar"></div>
      
      <!-- Header -->
      <div class="psd-header">
        <div class="psd-header-content">
          <div class="psd-icon-wrapper" [class.leave]="data.mode === 'leave'">
            <mat-icon>{{ getHeaderIcon() }}</mat-icon>
          </div>
          <div class="psd-title-group">
            <h2 class="psd-title">{{ getTitle() }}</h2>
            <p class="psd-subtitle">{{ getSubtitle() }}</p>
          </div>
        </div>
        <button type="button" class="psd-close-btn" (click)="dialogRef.close()" aria-label="Close">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Body -->
      <div class="psd-body">
        <form [formGroup]="form" class="psd-form">
          
          <!-- Staff Selection Card -->
          <div class="psd-field-card">
            <div class="psd-field-header">
              <div class="psd-field-icon"><mat-icon>person_outline</mat-icon></div>
              <span class="psd-field-title">Staff Member</span>
            </div>
            <mat-form-field appearance="outline" class="psd-input">
              <mat-select formControlName="staffId" placeholder="Choose a team member">
                @for (staff of data.staffList; track staff._id) {
                  <mat-option [value]="staff._id">
                    <div class="psd-staff-option">
                      <span class="name">{{ staff.name }}</span>
                      <span class="role">{{ staff.role || 'Staff' }}</span>
                    </div>
                  </mat-option>
                }
              </mat-select>
              @if (form.get('staffId')?.hasError('required') && form.get('staffId')?.touched) {
                <mat-error>Please select a staff member</mat-error>
              }
            </mat-form-field>
          </div>

          <!-- Date Card -->
          <div class="psd-field-card">
            <div class="psd-field-header">
              <div class="psd-field-icon"><mat-icon>calendar_today</mat-icon></div>
              <span class="psd-field-title">{{ data.mode === 'leave' ? 'Leave Date' : 'Schedule Date' }}</span>
            </div>
            <mat-form-field appearance="outline" class="psd-input">
              <input matInput [matDatepicker]="picker" formControlName="date" placeholder="Pick a date">
              <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
              @if (form.get('date')?.hasError('required') && form.get('date')?.touched) {
                <mat-error>Date is required</mat-error>
              }
            </mat-form-field>
          </div>

          @if (data.mode !== 'leave') {
            <!-- Time Selection -->
            <div class="psd-time-grid">
              <div class="psd-field-card time-card">
                <div class="psd-field-header">
                  <div class="psd-field-icon start"><mat-icon>login</mat-icon></div>
                  <span class="psd-field-title">Start</span>
                </div>
                <mat-form-field appearance="outline" class="psd-input">
                  <mat-select formControlName="startTime">
                    @for (time of timeSlots; track time) {
                      <mat-option [value]="time">{{ time }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
              </div>
              <div class="psd-time-arrow">
                <mat-icon>east</mat-icon>
              </div>
              <div class="psd-field-card time-card">
                <div class="psd-field-header">
                  <div class="psd-field-icon end"><mat-icon>logout</mat-icon></div>
                  <span class="psd-field-title">End</span>
                </div>
                <mat-form-field appearance="outline" class="psd-input">
                  <mat-select formControlName="endTime">
                    @for (time of timeSlots; track time) {
                      <mat-option [value]="time">{{ time }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
              </div>
            </div>

            <!-- Break Toggle -->
            <div class="psd-break-section">
              <mat-slide-toggle formControlName="hasBreak" color="primary">
                <span class="break-label">Include break time</span>
              </mat-slide-toggle>
              
              @if (form.get('hasBreak')?.value) {
                <div class="psd-break-times">
                  <div class="psd-mini-field">
                    <label>Break Start</label>
                    <mat-form-field appearance="outline" class="psd-input mini">
                      <mat-select formControlName="breakStart">
                        @for (time of timeSlots; track time) {
                          <mat-option [value]="time">{{ time }}</mat-option>
                        }
                      </mat-select>
                    </mat-form-field>
                  </div>
                  <div class="psd-mini-field">
                    <label>Break End</label>
                    <mat-form-field appearance="outline" class="psd-input mini">
                      <mat-select formControlName="breakEnd">
                        @for (time of timeSlots; track time) {
                          <mat-option [value]="time">{{ time }}</mat-option>
                        }
                      </mat-select>
                    </mat-form-field>
                  </div>
                </div>
              }
            </div>
          } @else {
            <!-- Leave Type Card -->
            <div class="psd-field-card">
              <div class="psd-field-header">
                <div class="psd-field-icon leave"><mat-icon>event_busy</mat-icon></div>
                <span class="psd-field-title">Leave Type</span>
              </div>
              <mat-form-field appearance="outline" class="psd-input">
                <mat-select formControlName="leaveType" placeholder="Select reason">
                  <mat-option value="sick">
                    <div class="psd-leave-option">
                      <mat-icon>healing</mat-icon>
                      <span>Sick Leave</span>
                    </div>
                  </mat-option>
                  <mat-option value="vacation">
                    <div class="psd-leave-option">
                      <mat-icon>beach_access</mat-icon>
                      <span>Vacation</span>
                    </div>
                  </mat-option>
                  <mat-option value="personal">
                    <div class="psd-leave-option">
                      <mat-icon>person</mat-icon>
                      <span>Personal Leave</span>
                    </div>
                  </mat-option>
                  <mat-option value="emergency">
                    <div class="psd-leave-option">
                      <mat-icon>warning</mat-icon>
                      <span>Emergency</span>
                    </div>
                  </mat-option>
                  <mat-option value="other">
                    <div class="psd-leave-option">
                      <mat-icon>more_horiz</mat-icon>
                      <span>Other</span>
                    </div>
                  </mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <!-- Notes Card -->
            <div class="psd-field-card notes-card">
              <div class="psd-field-header">
                <div class="psd-field-icon notes"><mat-icon>edit_note</mat-icon></div>
                <span class="psd-field-title">Additional Notes</span>
                <span class="psd-field-hint">(Optional)</span>
              </div>
              <mat-form-field appearance="outline" class="psd-input textarea">
                <textarea matInput formControlName="leaveReason" rows="2" 
                          placeholder="Add any details here..."></textarea>
              </mat-form-field>
            </div>
          }
        </form>
      </div>

      <!-- Footer -->
      <div class="psd-footer">
        <button type="button" class="psd-btn cancel" (click)="dialogRef.close()">
          Cancel
        </button>
        <button type="button" class="psd-btn submit" [class.leave]="data.mode === 'leave'" 
                (click)="save()" [disabled]="form.invalid || saving">
          @if (saving) {
            <span class="psd-spinner"></span>
          } @else {
            <mat-icon>{{ data.mode === 'leave' ? 'check_circle' : 'save' }}</mat-icon>
          }
          <span>{{ getButtonText() }}</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    /* ========== PREMIUM SCHEDULE DIALOG ========== */
    .premium-schedule-dialog {
      display: flex;
      flex-direction: column;
      width: 100%;
      max-width: 420px;
      background: #fff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }

    .dialog-accent-bar {
      height: 4px;
      background: linear-gradient(90deg, #7c3aed, #a78bfa, #7c3aed);
      background-size: 200% 100%;
      animation: shimmer 2s linear infinite;
    }

    .premium-schedule-dialog.leave-mode .dialog-accent-bar {
      background: linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b);
      background-size: 200% 100%;
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
      background: linear-gradient(135deg, #f8f7ff 0%, #fff 100%);
      border-bottom: 1px solid #f0ecfc;
    }

    .premium-schedule-dialog.leave-mode .psd-header {
      background: linear-gradient(135deg, #fffbeb 0%, #fff 100%);
      border-bottom-color: #fef3c7;
    }

    .psd-header-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .psd-icon-wrapper {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: linear-gradient(135deg, #7c3aed, #9333ea);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
    }

    .psd-icon-wrapper.leave {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
    }

    .psd-icon-wrapper mat-icon {
      color: #fff;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .psd-title-group {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .psd-title {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
      color: #1f2937;
      letter-spacing: -0.01em;
    }

    .psd-subtitle {
      margin: 0;
      font-size: 12px;
      color: #6b7280;
    }

    .psd-close-btn {
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
      flex-shrink: 0;
    }

    .psd-close-btn:hover {
      background: rgba(0,0,0,0.08);
      color: #374151;
    }

    .psd-close-btn mat-icon {
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

    /* Field Cards */
    .psd-field-card {
      background: #fafafa;
      border: 1px solid #f0f0f0;
      border-radius: 10px;
      padding: 12px;
      transition: all 0.15s ease;
    }

    .psd-field-card:focus-within {
      background: #fff;
      border-color: #e9d5ff;
      box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.08);
    }

    .psd-field-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .psd-field-icon {
      width: 24px;
      height: 24px;
      border-radius: 6px;
      background: #ede9fe;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .psd-field-icon mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
      color: #7c3aed;
    }

    .psd-field-icon.leave { background: #fef3c7; }
    .psd-field-icon.leave mat-icon { color: #d97706; }
    .psd-field-icon.notes { background: #e0e7ff; }
    .psd-field-icon.notes mat-icon { color: #4f46e5; }
    .psd-field-icon.start { background: #d1fae5; }
    .psd-field-icon.start mat-icon { color: #059669; }
    .psd-field-icon.end { background: #fee2e2; }
    .psd-field-icon.end mat-icon { color: #dc2626; }

    .psd-field-title {
      font-size: 11px;
      font-weight: 600;
      color: #374151;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .psd-field-hint {
      font-size: 10px;
      color: #9ca3af;
      margin-left: auto;
    }

    /* Form Field Overrides */
    .psd-input {
      width: 100%;
    }

    .psd-input .mat-mdc-form-field-subscript-wrapper {
      display: none;
    }

    .psd-input.textarea .mat-mdc-form-field-subscript-wrapper {
      display: block;
    }

    .psd-input .mat-mdc-text-field-wrapper {
      background: #fff !important;
      border-radius: 8px !important;
    }

    .psd-input .mdc-notched-outline__leading,
    .psd-input .mdc-notched-outline__notch,
    .psd-input .mdc-notched-outline__trailing {
      border-color: #e5e7eb !important;
    }

    .psd-input.mat-focused .mdc-notched-outline__leading,
    .psd-input.mat-focused .mdc-notched-outline__notch,
    .psd-input.mat-focused .mdc-notched-outline__trailing {
      border-color: #7c3aed !important;
    }

    .psd-input .mat-mdc-form-field-infix {
      min-height: 40px !important;
      padding: 8px 0 !important;
    }

    .psd-input .mat-mdc-select-value,
    .psd-input input {
      font-size: 13px !important;
    }

    .psd-input textarea {
      font-size: 13px !important;
      line-height: 1.5;
    }

    /* Staff Option in dropdown */
    .psd-staff-option {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .psd-staff-option .name {
      font-weight: 500;
      font-size: 13px;
    }

    .psd-staff-option .role {
      font-size: 11px;
      color: #9ca3af;
      text-transform: capitalize;
    }

    /* Leave Option */
    .psd-leave-option {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .psd-leave-option mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #6b7280;
    }

    /* Time Grid */
    .psd-time-grid {
      display: flex;
      align-items: stretch;
      gap: 8px;
    }

    .psd-time-grid .time-card {
      flex: 1;
    }

    .psd-time-arrow {
      display: flex;
      align-items: center;
      justify-content: center;
      color: #d1d5db;
      padding-top: 28px;
    }

    .psd-time-arrow mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    /* Break Section */
    .psd-break-section {
      background: linear-gradient(135deg, #f5f3ff, #faf5ff);
      border: 1px solid #ede9fe;
      border-radius: 10px;
      padding: 12px;
    }

    .psd-break-section mat-slide-toggle {
      font-size: 13px;
    }

    .break-label {
      font-size: 13px;
      font-weight: 500;
      color: #4b5563;
    }

    .psd-break-times {
      display: flex;
      gap: 12px;
      margin-top: 12px;
      animation: fadeIn 0.2s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .psd-mini-field {
      flex: 1;
    }

    .psd-mini-field label {
      display: block;
      font-size: 10px;
      font-weight: 600;
      color: #6b7280;
      margin-bottom: 4px;
      text-transform: uppercase;
    }

    .psd-input.mini .mat-mdc-form-field-infix {
      min-height: 36px !important;
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
      padding: 10px 16px;
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

    .psd-btn.submit.leave {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
    }

    .psd-btn.submit.leave:hover:not(:disabled) {
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
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
      .premium-schedule-dialog {
        max-width: 100%;
        border-radius: 12px;
      }

      .dialog-accent-bar {
        height: 3px;
      }

      .psd-header {
        padding: 12px 14px;
      }

      .psd-icon-wrapper {
        width: 36px;
        height: 36px;
        border-radius: 8px;
      }

      .psd-icon-wrapper mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      .psd-title {
        font-size: 14px;
      }

      .psd-subtitle {
        font-size: 11px;
      }

      .psd-close-btn {
        width: 28px;
        height: 28px;
      }

      .psd-close-btn mat-icon {
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

      .psd-field-card {
        padding: 10px;
        border-radius: 8px;
      }

      .psd-field-header {
        margin-bottom: 6px;
      }

      .psd-field-icon {
        width: 22px;
        height: 22px;
      }

      .psd-field-icon mat-icon {
        font-size: 12px;
        width: 12px;
        height: 12px;
      }

      .psd-field-title {
        font-size: 10px;
      }

      .psd-input .mat-mdc-form-field-infix {
        min-height: 36px !important;
      }

      .psd-input .mat-mdc-select-value,
      .psd-input input,
      .psd-input textarea {
        font-size: 12px !important;
      }

      .psd-time-grid {
        flex-direction: column;
        gap: 10px;
      }

      .psd-time-arrow {
        display: none;
      }

      .psd-break-section {
        padding: 10px;
      }

      .psd-break-times {
        flex-direction: column;
        gap: 10px;
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

      .psd-icon-wrapper {
        width: 32px;
        height: 32px;
      }

      .psd-title {
        font-size: 13px;
      }

      .psd-body {
        padding: 10px 12px;
      }

      .psd-field-card {
        padding: 8px;
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
export class ScheduleDialogComponent implements OnInit {
  form: FormGroup;
  saving = false;
  timeSlots: string[] = [];

  constructor(
    private fb: FormBuilder,
    private scheduleService: ScheduleService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<ScheduleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ScheduleDialogData
  ) {
    this.form = this.fb.group({
      staffId: [data.schedule?.staff?._id || '', Validators.required],
      date: [data.schedule?.date ? new Date(data.schedule.date) : new Date(), Validators.required],
      startTime: [data.schedule?.startTime || '09:00'],
      endTime: [data.schedule?.endTime || '18:00'],
      hasBreak: [!!data.schedule?.breakStart],
      breakStart: [data.schedule?.breakStart || '13:00'],
      breakEnd: [data.schedule?.breakEnd || '14:00'],
      leaveType: ['personal'],
      leaveReason: [data.schedule?.leaveReason || '']
    });

    this.generateTimeSlots();
  }

  ngOnInit(): void {}

  generateTimeSlots(): void {
    for (let hour = 6; hour <= 22; hour++) {
      for (let min = 0; min < 60; min += 30) {
        const h = hour.toString().padStart(2, '0');
        const m = min.toString().padStart(2, '0');
        this.timeSlots.push(`${h}:${m}`);
      }
    }
  }

  getHeaderIcon(): string {
    if (this.data.mode === 'leave') return 'event_busy';
    if (this.data.mode === 'edit') return 'edit_calendar';
    return 'calendar_month';
  }

  getTitle(): string {
    if (this.data.mode === 'leave') return 'Add Leave Request';
    if (this.data.mode === 'edit') return 'Edit Schedule';
    return 'Create Schedule';
  }

  getSubtitle(): string {
    if (this.data.mode === 'leave') return 'Record staff leave or time off';
    if (this.data.mode === 'edit') return 'Update working hours';
    return 'Set up staff working hours';
  }

  getButtonText(): string {
    if (this.saving) return 'Saving...';
    if (this.data.mode === 'leave') return 'Add Leave';
    if (this.data.mode === 'edit') return 'Save Changes';
    return 'Create Schedule';
  }

  save(): void {
    if (this.form.invalid) return;

    this.saving = true;
    const values = this.form.value;

    if (this.data.mode === 'leave') {
      this.scheduleService.createLeave(
        values.staffId,
        values.date.toISOString().split('T')[0],
        values.leaveType,
        values.leaveReason || undefined
      ).subscribe({
        next: () => {
          this.snackBar.open('Leave added successfully!', 'Close', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.saving = false;
          console.error('Leave error:', err);
          this.snackBar.open('Failed to add leave', 'Close', { duration: 3000 });
        }
      });
    } else {
      const scheduleData: any = {
        staff: values.staffId,
        date: values.date,
        startTime: values.startTime,
        endTime: values.endTime,
        isAvailable: true,
        isLeave: false
      };

      if (values.hasBreak) {
        scheduleData.breakStart = values.breakStart;
        scheduleData.breakEnd = values.breakEnd;
      }

      const obs = this.data.schedule
        ? this.scheduleService.update(this.data.schedule._id, scheduleData)
        : this.scheduleService.create(scheduleData);

      obs.subscribe({
        next: () => {
          this.snackBar.open(
            this.data.schedule ? 'Schedule updated!' : 'Schedule created!',
            'Close',
            { duration: 3000 }
          );
          this.dialogRef.close(true);
        },
        error: () => {
          this.saving = false;
          this.snackBar.open('Operation failed', 'Close', { duration: 3000 });
        }
      });
    }
  }
}
