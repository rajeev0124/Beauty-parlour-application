import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { LoyaltyAccount } from '../../core/services/loyalty.service';

interface QuickReason {
  label: string;
  value: string;
  icon: string;
}

@Component({
  selector: 'app-bonus-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <div class="bonus-dialog">
      <!-- Accent top bar -->
      <div class="dialog-accent-bar"></div>

      <!-- Header -->
      <div class="sd-header">
        <div class="sd-header-icon">
          <mat-icon>add_moderator</mat-icon>
        </div>
        <div class="sd-header-text">
          <h2>Grant Bonus Points</h2>
          <p>Add points to user's loyalty ledger</p>
        </div>
        <button type="button" class="sd-close-btn" (click)="dialogRef.close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Member Quick Card -->
      <div class="member-quick-card">
        <div class="avatar" [style.background]="getAvatarGradient(data.user.name)">
          {{ getInitials(data.user.name) }}
        </div>
        <div class="info">
          <span class="name">{{ data.user.name }}</span>
          <span class="email">{{ data.user.email }}</span>
        </div>
        <div class="ledger">
          <span class="points-label">Current balance</span>
          <span class="points-val">
            <mat-icon>stars</mat-icon>
            {{ data.points }} pts
          </span>
        </div>
      </div>

      <!-- Body Form -->
      <form [formGroup]="form" (ngSubmit)="submit()" class="sd-body">
        
        <!-- Quantity Input -->
        <div class="form-field">
          <label class="sd-label">
            Points to Add <span class="required">*</span>
          </label>
          <div class="sd-input-wrapper" [class.focused]="focusedField === 'points'" [class.error]="hasError('points')">
            <mat-icon class="input-icon">stars</mat-icon>
            <input 
              type="number" 
              formControlName="points" 
              placeholder="e.g. 100" 
              (focus)="focusedField = 'points'" 
              (blur)="focusedField = null"
              min="1"
            />
            <span class="suffix-badge">PTS</span>
          </div>
          @if (hasError('points')) {
            <span class="field-error">Please enter a valid positive number</span>
          }
        </div>

        <!-- Quick points addition chips -->
        <div class="chips-container">
          <span class="chips-label">Quick Add</span>
          <div class="point-chips">
            @for (amt of quickAddAmounts; track amt) {
              <button type="button" class="point-chip" (click)="quickAdd(amt)">
                +{{ amt }}
              </button>
            }
          </div>
        </div>

        <!-- Reason Input -->
        <div class="form-field">
          <label class="sd-label">Reason / Reference Note</label>
          <div class="sd-input-wrapper" [class.focused]="focusedField === 'reason'" [class.error]="hasError('reason')">
            <mat-icon class="input-icon">chat_bubble_outline</mat-icon>
            <input 
              type="text" 
              formControlName="reason" 
              placeholder="e.g. Promotional bonus or Customer goodwill" 
              (focus)="focusedField = 'reason'" 
              (blur)="focusedField = null"
            />
          </div>
        </div>

        <!-- Quick Reason Tags -->
        <div class="chips-container">
          <span class="chips-label">Quick Reasons</span>
          <div class="reason-chips">
            @for (qr of quickReasons; track qr.value) {
              <button type="button" class="reason-chip" (click)="selectReason(qr.value)">
                <mat-icon>{{ qr.icon }}</mat-icon>
                {{ qr.label }}
              </button>
            }
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="sd-footer">
          <button type="button" class="sd-btn cancel" (click)="dialogRef.close()">
            <mat-icon>close</mat-icon>
            Cancel
          </button>
          <button type="submit" class="sd-btn submit" [disabled]="form.invalid">
            <mat-icon>add_circle</mat-icon>
            Add Points
          </button>
        </div>

      </form>
    </div>
  `,
  styles: [`
    .cdk-overlay-pane:has(.bonus-dialog) {
      max-width: 95vw !important;
    }

    .mat-mdc-dialog-container:has(.bonus-dialog) {
      --mdc-dialog-container-shape: 24px;
      padding: 0 !important;
      background: transparent !important;
      box-shadow: none !important;
    }

    .mat-mdc-dialog-container:has(.bonus-dialog) .mdc-dialog__surface {
      background: transparent !important;
      box-shadow: none !important;
      border-radius: 24px !important;
      overflow: visible !important;
    }

    .bonus-dialog {
      width: 100%;
      max-width: 480px;
      background: #fff;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      display: flex;
      flex-direction: column;
      font-family: 'Outfit', 'Inter', sans-serif;
    }

    .dialog-accent-bar {
      height: 4px;
      background: linear-gradient(90deg, #6366f1, #8b5cf6, #6366f1);
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
      background: linear-gradient(135deg, #eef2ff 0%, #fff 100%);
      border-bottom: 1px solid #e0e7ff;
      position: relative;
    }

    .sd-header-icon {
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);

      mat-icon {
        font-size: 22px;
        width: 22px;
        height: 22px;
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
      background: rgba(0, 0, 0, 0.04);
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
        background: rgba(0, 0, 0, 0.08);
        transform: scale(1.05);
      }
    }

    // ========== MEMBER QUICK CARD ==========
    .member-quick-card {
      margin: 20px 24px 0;
      padding: 14px 16px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      display: flex;
      align-items: center;
      gap: 12px;

      .avatar {
        width: 42px;
        height: 42px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 15px;
        font-weight: 700;
        color: #fff;
        flex-shrink: 0;
      }

      .info {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;

        .name {
          font-size: 14px;
          font-weight: 700;
          color: #1f2937;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
        }

        .email {
          font-size: 11px;
          color: #6b7280;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
        }
      }

      .ledger {
        text-align: right;
        display: flex;
        flex-direction: column;
        align-items: flex-end;

        .points-label {
          font-size: 10px;
          font-weight: 500;
          color: #94a3b8;
          text-transform: uppercase;
        }

        .points-val {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          font-weight: 700;
          color: #059669;

          mat-icon {
            font-size: 16px;
            width: 16px;
            height: 16px;
          }
        }
      }
    }

    // ========== FORM BODY ==========
    .sd-body {
      padding: 20px 24px 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .sd-label {
      font-size: 13px;
      font-weight: 600;
      color: #374151;

      .required {
        color: #ef4444;
      }
    }

    .field-error {
      font-size: 11px;
      color: #ef4444;
      font-weight: 600;
      margin-top: 2px;
    }

    .sd-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      background: #f8fafc;
      transition: all 0.2s ease;
      overflow: hidden;

      &.focused {
        border-color: #6366f1;
        background: #fff;
        box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        
        .input-icon {
          color: #6366f1;
        }
      }

      &.error {
        border-color: #ef4444;
        background: #fef2f2;
      }

      .input-icon {
        margin-left: 14px;
        color: #94a3b8;
        font-size: 20px;
        width: 20px;
        height: 20px;
        transition: color 0.2s ease;
        flex-shrink: 0;
      }

      input {
        flex: 1;
        width: 100%;
        padding: 12px 14px;
        border: none;
        background: transparent;
        font-size: 14px;
        color: #1f2937;
        outline: none;
        box-sizing: border-box;
        font-family: inherit;

        &::placeholder {
          color: #94a3b8;
        }
      }

      .suffix-badge {
        font-size: 11px;
        font-weight: 700;
        color: #4f46e5;
        background: #e0e7ff;
        padding: 12px 14px;
        margin-left: auto;
      }
    }

    // ========== CHIPS CONTAINER ==========
    .chips-container {
      display: flex;
      flex-direction: column;
      gap: 6px;

      .chips-label {
        font-size: 11px;
        font-weight: 600;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .point-chips, .reason-chips {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .point-chip {
        flex: 1;
        min-width: 60px;
        padding: 8px 12px;
        border: 2px solid #e2e8f0;
        border-radius: 10px;
        background: #fff;
        font-size: 12px;
        font-weight: 700;
        color: #4f46e5;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          border-color: #6366f1;
          background: #e0e7ff;
        }
      }

      .reason-chip {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 8px 12px;
        border: 2px solid #e2e8f0;
        border-radius: 10px;
        background: #fff;
        font-size: 11px;
        font-weight: 600;
        color: #4b5563;
        cursor: pointer;
        transition: all 0.2s ease;

        mat-icon {
          font-size: 14px;
          width: 14px;
          height: 14px;
        }

        &:hover {
          border-color: #6366f1;
          color: #4f46e5;
          background: #e0e7ff;
        }
      }
    }

    // ========== FOOTER ==========
    .sd-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 10px;
      padding-top: 16px;
      border-top: 1px solid #f1f5f9;
    }

    .sd-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 11px 20px;
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
        border: 1px solid #e2e8f0;

        &:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }
      }

      &.submit {
        background: linear-gradient(135deg, #6366f1, #4f46e5);
        color: #fff;
        box-shadow: 0 4px 14px rgba(99, 102, 241, 0.25);

        &:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(99, 102, 241, 0.35);
        }

        &:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          box-shadow: none;
          transform: none;
        }
      }
    }

    @media (max-width: 480px) {
      .bonus-dialog {
        border-radius: 20px;
      }

      .sd-header {
        padding: 16px 20px;
      }

      .sd-body {
        padding: 16px 20px 20px;
        gap: 14px;
      }

      .member-quick-card {
        margin: 16px 20px 0;
        padding: 10px 12px;
      }

      .chips-container {
        .point-chips {
          grid-template-columns: repeat(2, 1fr);
          display: grid;
        }
      }
    }
  `]
})
export class BonusDialogComponent implements OnInit {
  form!: FormGroup;
  focusedField: string | null = null;

  quickAddAmounts = [50, 100, 250, 500];

  quickReasons: QuickReason[] = [
    { label: 'Customer Goodwill', value: 'Customer goodwill appreciation', icon: 'favorite' },
    { label: 'Referral Bonus', value: 'Successful friend referral credit', icon: 'share' },
    { label: 'Service Promo', value: 'Special service promotional bonus', icon: 'celebration' },
    { label: 'Compensation', value: 'Service delay compensation credit', icon: 'build_circle' }
  ];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<BonusDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: LoyaltyAccount
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      points: [null, [Validators.required, Validators.min(1), Validators.pattern(/^[0-9]+$/)]],
      reason: ['', Validators.maxLength(150)]
    });
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  getAvatarGradient(name: string): string {
    const colors = [
      'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
      'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
      'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
      'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
      'linear-gradient(135deg, #ef4444 0%, #f87171 100%)'
    ];
    const index = (name?.charCodeAt(0) || 0) % colors.length;
    return colors[index];
  }

  hasError(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  quickAdd(amount: number): void {
    const current = this.form.get('points')?.value || 0;
    this.form.get('points')?.setValue(current + amount);
    this.form.get('points')?.markAsDirty();
  }

  selectReason(reason: string): void {
    this.form.get('reason')?.setValue(reason);
    this.form.get('reason')?.markAsDirty();
  }

  submit(): void {
    if (this.form.valid) {
      this.dialogRef.close({
        points: this.form.value.points,
        reason: this.form.value.reason || 'Manual bonus'
      });
    }
  }
}
