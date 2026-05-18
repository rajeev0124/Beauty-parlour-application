import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
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
    MatSlideToggleModule,
    MatIconModule,
    MatSnackBarModule
  ],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="schedule-dialog" [class.leave-mode]="data.mode === 'leave'">
      <!-- Decorative top accent bar -->
      <div class="dialog-accent-bar"></div>

      <!-- Header -->
      <div class="sd-header">
        <div class="sd-header-icon" [class.leave]="data.mode === 'leave'">
          <mat-icon>{{ getHeaderIcon() }}</mat-icon>
        </div>
        <div class="sd-header-text">
          <h2>{{ getTitle() }}</h2>
          <p>{{ getSubtitle() }}</p>
        </div>
        <button type="button" class="sd-close-btn" (click)="dialogRef.close()" aria-label="Close">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Body -->
      <div class="sd-body">
        <form [formGroup]="form" class="sd-form">
          <!-- Staff Selection Field -->
          <div class="sd-field">
            <label class="sd-label">Staff Member <span class="required">*</span></label>
            <div class="sd-input-wrapper" [class.error]="form.get('staffId')?.invalid && form.get('staffId')?.touched" [class.focused]="staffFocused">
              <mat-icon class="input-icon">person_outline</mat-icon>
              <select 
                formControlName="staffId"
                (focus)="staffFocused = true"
                (blur)="staffFocused = false">
                <option value="" disabled selected>Choose a team member</option>
                @for (staff of data.staffList; track staff._id) {
                  <option [value]="staff._id">{{ staff.name }} ({{ staff.role || 'Staff' }})</option>
                }
              </select>
              <mat-icon class="select-arrow">expand_more</mat-icon>
            </div>
            @if (form.get('staffId')?.hasError('required') && form.get('staffId')?.touched) {
              <span class="sd-error">
                <mat-icon>error</mat-icon>
                Please select a staff member
              </span>
            }
          </div>

          <!-- Date Field -->
          <div class="sd-field">
            <label class="sd-label">{{ data.mode === 'leave' ? 'Leave Date' : 'Schedule Date' }} <span class="required">*</span></label>
            <div class="sd-input-wrapper" [class.error]="form.get('date')?.invalid && form.get('date')?.touched" [class.focused]="dateFocused">
              <mat-icon class="input-icon">calendar_today</mat-icon>
              <input 
                type="date" 
                formControlName="date"
                (focus)="dateFocused = true"
                (blur)="dateFocused = false">
            </div>
            @if (form.get('date')?.hasError('required') && form.get('date')?.touched) {
              <span class="sd-error">
                <mat-icon>error</mat-icon>
                Date is required
              </span>
            }
          </div>

          @if (data.mode !== 'leave') {
            <!-- Shift Time Row -->
            <div class="sd-row">
              <!-- Start Time -->
              <div class="sd-field">
                <label class="sd-label">Start Time</label>
                <div class="sd-input-wrapper" [class.focused]="startFocused">
                  <mat-icon class="input-icon">login</mat-icon>
                  <select 
                    formControlName="startTime"
                    (focus)="startFocused = true"
                    (blur)="startFocused = false">
                    @for (time of timeSlots; track time) {
                      <option [value]="time">{{ time }}</option>
                    }
                  </select>
                  <mat-icon class="select-arrow">expand_more</mat-icon>
                </div>
              </div>

              <!-- End Time -->
              <div class="sd-field">
                <label class="sd-label">End Time</label>
                <div class="sd-input-wrapper" [class.focused]="endFocused">
                  <mat-icon class="input-icon">logout</mat-icon>
                  <select 
                    formControlName="endTime"
                    (focus)="endFocused = true"
                    (blur)="endFocused = false">
                    @for (time of timeSlots; track time) {
                      <option [value]="time">{{ time }}</option>
                    }
                  </select>
                  <mat-icon class="select-arrow">expand_more</mat-icon>
                </div>
              </div>
            </div>

            <!-- Include Break Toggle Wrapper -->
            <div class="sd-toggle-field">
              <div class="sd-toggle-info">
                <div class="sd-toggle-icon available">
                  <mat-icon>coffee</mat-icon>
                </div>
                <div class="sd-toggle-text">
                  <span class="sd-toggle-label">Shift Break Time</span>
                  <span class="sd-toggle-desc">Include staff break intervals</span>
                </div>
              </div>
              <mat-slide-toggle formControlName="hasBreak" color="primary"></mat-slide-toggle>
            </div>

            <!-- Break Times Row (conditional) -->
            @if (form.get('hasBreak')?.value) {
              <div class="sd-row break-times-fade">
                <!-- Break Start -->
                <div class="sd-field">
                  <label class="sd-label">Break Start</label>
                  <div class="sd-input-wrapper" [class.focused]="breakStartFocused">
                    <mat-icon class="input-icon">schedule</mat-icon>
                    <select 
                      formControlName="breakStart"
                      (focus)="breakStartFocused = true"
                      (blur)="breakStartFocused = false">
                      @for (time of timeSlots; track time) {
                        <option [value]="time">{{ time }}</option>
                      }
                    </select>
                    <mat-icon class="select-arrow">expand_more</mat-icon>
                  </div>
                </div>

                <!-- Break End -->
                <div class="sd-field">
                  <label class="sd-label">Break End</label>
                  <div class="sd-input-wrapper" [class.focused]="breakEndFocused">
                    <mat-icon class="input-icon">done</mat-icon>
                    <select 
                      formControlName="breakEnd"
                      (focus)="breakEndFocused = true"
                      (blur)="breakEndFocused = false">
                      @for (time of timeSlots; track time) {
                        <option [value]="time">{{ time }}</option>
                      }
                    </select>
                    <mat-icon class="select-arrow">expand_more</mat-icon>
                  </div>
                </div>
              </div>
            }
          } @else {
            <!-- Leave Type -->
            <div class="sd-field">
              <label class="sd-label">Leave Type <span class="required">*</span></label>
              <div class="sd-input-wrapper" [class.focused]="leaveTypeFocused">
                <mat-icon class="input-icon">event_busy</mat-icon>
                <select 
                  formControlName="leaveType"
                  (focus)="leaveTypeFocused = true"
                  (blur)="leaveTypeFocused = false">
                  <option value="personal">Personal Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="vacation">Vacation</option>
                  <option value="emergency">Emergency Time Off</option>
                  <option value="other">Other</option>
                </select>
                <mat-icon class="select-arrow">expand_more</mat-icon>
              </div>
            </div>

            <!-- Notes Description -->
            <div class="sd-field">
              <label class="sd-label">Additional Notes</label>
              <div class="sd-input-wrapper textarea" [class.focused]="notesFocused">
                <mat-icon class="input-icon">edit_note</mat-icon>
                <textarea 
                  formControlName="leaveReason" 
                  rows="3" 
                  placeholder="Explain reason for leave..."
                  (focus)="notesFocused = true"
                  (blur)="notesFocused = false"></textarea>
              </div>
            </div>
          }
        </form>
      </div>

      <!-- Footer -->
      <div class="sd-footer">
        <button type="button" class="sd-btn cancel" (click)="dialogRef.close()">
          <mat-icon>close</mat-icon>
          Cancel
        </button>
        <button type="button" class="sd-btn submit" [class.leave]="data.mode === 'leave'" 
                (click)="save()" [disabled]="form.invalid || saving">
          @if (saving) {
            <span class="sd-spinner"></span>
          } @else {
            <mat-icon>{{ data.mode === 'leave' ? 'check_circle' : (data.mode === 'edit' ? 'save' : 'calendar_today') }}</mat-icon>
          }
          <span>{{ getButtonText() }}</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .cdk-overlay-pane:has(.schedule-dialog) {
      max-width: 95vw !important;
    }

    .mat-mdc-dialog-container:has(.schedule-dialog) {
      padding: 0 !important;
      background: transparent !important;
      box-shadow: none !important;
    }

    .mat-mdc-dialog-container:has(.schedule-dialog) .mdc-dialog__surface {
      background: transparent !important;
      box-shadow: none !important;
      border-radius: 20px !important;
      overflow: visible !important;
    }

    .schedule-dialog {
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
      background: linear-gradient(90deg, #7c3aed, #a78bfa, #7c3aed);
      background-size: 200% 100%;
      animation: shimmer 2s linear infinite;
    }

    .schedule-dialog.leave-mode .dialog-accent-bar {
      background: linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b);
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
      background: linear-gradient(135deg, #fbfaff 0%, #fff 100%);
      border-bottom: 1px solid #f3f0ff;
      position: relative;
    }

    .schedule-dialog.leave-mode .sd-header {
      background: linear-gradient(135deg, #fffbeb 0%, #fff 100%);
      border-bottom-color: #fef3c7;
    }

    .sd-header-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #7c3aed, #9333ea);
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

      &.leave {
        background: linear-gradient(135deg, #f59e0b, #d97706);
        box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
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

    .break-times-fade {
      animation: slideDownFade 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    @keyframes slideDownFade {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
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

      .schedule-dialog.leave-mode &.focused {
        border-color: #f59e0b;
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
      background: #fbfaff;
      border: 1px solid #ede9fe;
      border-radius: 12px;
      gap: 16px;
      margin-top: 4px;
    }

    .schedule-dialog.leave-mode .sd-toggle-field {
      background: #fffbeb;
      border-color: #fef3c7;
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
      background: #ede9fe;
      transition: all 0.2s ease;
      flex-shrink: 0;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        color: #7c3aed;
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
        background: linear-gradient(135deg, #7c3aed, #9333ea);
        color: #fff;
        box-shadow: 0 4px 14px rgba(124, 58, 237, 0.3);

        &:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(124, 58, 237, 0.4);
        }

        &.leave {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          box-shadow: 0 4px 14px rgba(245, 158, 11, 0.3);

          &:hover:not(:disabled) {
            box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
          }
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
      .schedule-dialog {
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
export class ScheduleDialogComponent implements OnInit {
  form: FormGroup;
  saving = false;
  timeSlots: string[] = [];

  staffFocused = false;
  dateFocused = false;
  startFocused = false;
  endFocused = false;
  breakStartFocused = false;
  breakEndFocused = false;
  leaveTypeFocused = false;
  notesFocused = false;

  constructor(
    private fb: FormBuilder,
    private scheduleService: ScheduleService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<ScheduleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ScheduleDialogData
  ) {
    this.form = this.fb.group({
      staffId: [data.schedule?.staff?._id || '', Validators.required],
      date: [this.formatDate(data.schedule?.date || new Date()), Validators.required],
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

  formatDate(date: any): string {
    const d = new Date(date);
    const month = '' + (d.getMonth() + 1);
    const day = '' + d.getDate();
    const year = d.getFullYear();

    return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
  }

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

    const dateStr = typeof values.date === 'string' 
      ? values.date 
      : values.date.toISOString().split('T')[0];

    if (this.data.mode === 'leave') {
      this.scheduleService.createLeave(
        values.staffId,
        dateStr,
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
        date: typeof values.date === 'string' ? new Date(values.date) : values.date,
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
