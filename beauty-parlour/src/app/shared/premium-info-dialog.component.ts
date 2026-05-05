import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface InfoDialogData {
  title: string;
  message?: string;
  items?: string[];  // For list items
  buttonText?: string;
  icon?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

@Component({
  selector: 'app-premium-info-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="info-dialog" [class]="data.type || 'info'">
      <!-- Icon -->
      <div class="info-icon-wrapper" [class]="data.type || 'info'">
        <div class="info-icon-circle">
          <mat-icon>{{ data.icon || getDefaultIcon() }}</mat-icon>
        </div>
        <div class="info-icon-ring"></div>
      </div>

      <!-- Content -->
      <h2 class="info-title">{{ data.title }}</h2>
      
      @if (data.message) {
        <p class="info-message">{{ data.message }}</p>
      }
      
      @if (data.items && data.items.length > 0) {
        <ul class="info-list">
          @for (item of data.items; track item) {
            <li>
              <mat-icon>check_circle</mat-icon>
              <span>{{ item }}</span>
            </li>
          }
        </ul>
      }

      <!-- Action -->
      <button class="info-btn" [class]="data.type || 'info'" (click)="close()">
        <mat-icon>{{ data.type === 'success' ? 'celebration' : 'thumb_up' }}</mat-icon>
        {{ data.buttonText || 'Got it!' }}
      </button>
    </div>
  `,
  styles: [`
    .info-dialog {
      padding: 36px;
      text-align: center;
      min-width: 360px;
      max-width: 440px;
    }

    // Icon
    .info-icon-wrapper {
      position: relative;
      width: 80px;
      height: 80px;
      margin: 0 auto 24px;

      &.info {
        .info-icon-circle {
          background: linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%);
          mat-icon { color: #2563EB; }
        }
        .info-icon-ring { border-color: rgba(59, 130, 246, 0.3); }
      }

      &.success {
        .info-icon-circle {
          background: linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%);
          mat-icon { color: #059669; }
        }
        .info-icon-ring { border-color: rgba(16, 185, 129, 0.3); }
      }

      &.warning {
        .info-icon-circle {
          background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
          mat-icon { color: #D97706; }
        }
        .info-icon-ring { border-color: rgba(245, 158, 11, 0.3); }
      }

      &.error {
        .info-icon-circle {
          background: linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%);
          mat-icon { color: #DC2626; }
        }
        .info-icon-ring { border-color: rgba(239, 68, 68, 0.3); }
      }
    }

    .info-icon-circle {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      z-index: 2;

      mat-icon {
        font-size: 42px;
        width: 42px;
        height: 42px;
      }
    }

    .info-icon-ring {
      position: absolute;
      inset: -4px;
      border-radius: 50%;
      border: 3px dashed transparent;
      opacity: 0.5;
      z-index: 1;
    }

    // Content
    .info-title {
      font-size: 24px;
      font-weight: 700;
      color: var(--ink, #1F2937);
      margin: 0 0 12px;
      letter-spacing: -0.02em;
    }

    .info-message {
      font-size: 15px;
      color: var(--ink-muted, #6B7280);
      line-height: 1.6;
      margin: 0 0 20px;
    }

    // List
    .info-list {
      list-style: none;
      padding: 0;
      margin: 0 0 28px;
      text-align: left;
      background: var(--surface-secondary, #F9FAFB);
      border-radius: 14px;
      padding: 16px 20px;
      max-height: 200px;
      overflow-y: auto;

      li {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 10px 0;
        border-bottom: 1px solid var(--border-light, #E5E7EB);

        &:last-child {
          border-bottom: none;
        }

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
          color: #10B981;
          flex-shrink: 0;
          margin-top: 2px;
        }

        span {
          font-size: 14px;
          color: var(--ink, #1F2937);
          line-height: 1.5;
        }
      }
    }

    // Button
    .info-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 0 36px;
      height: 52px;
      border-radius: 14px;
      font-size: 16px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      color: white;
      transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
      min-width: 160px;

      mat-icon {
        font-size: 22px;
        width: 22px;
        height: 22px;
      }

      &.info {
        background: linear-gradient(135deg, #2563EB 0%, #3B82F6 100%);
        box-shadow: 0 4px 16px rgba(37, 99, 235, 0.35);

        &:hover {
          box-shadow: 0 8px 28px rgba(37, 99, 235, 0.5);
          transform: translateY(-3px);
        }
      }

      &.success {
        background: linear-gradient(135deg, #059669 0%, #10B981 100%);
        box-shadow: 0 4px 16px rgba(16, 185, 129, 0.35);

        &:hover {
          box-shadow: 0 8px 28px rgba(16, 185, 129, 0.5);
          transform: translateY(-3px);
        }
      }

      &.warning {
        background: linear-gradient(135deg, #D97706 0%, #F59E0B 100%);
        box-shadow: 0 4px 16px rgba(217, 119, 6, 0.35);

        &:hover {
          box-shadow: 0 8px 28px rgba(217, 119, 6, 0.5);
          transform: translateY(-3px);
        }
      }

      &.error {
        background: linear-gradient(135deg, #DC2626 0%, #EF4444 100%);
        box-shadow: 0 4px 16px rgba(220, 38, 38, 0.35);

        &:hover {
          box-shadow: 0 8px 28px rgba(220, 38, 38, 0.5);
          transform: translateY(-3px);
        }
      }

      &:active {
        transform: translateY(-1px) scale(0.98);
      }
    }

    // Dark mode
    :host-context(.dark-mode),
    :host-context(.dark-theme) {
      .info-title { color: #F9FAFB; }
      .info-message { color: #9CA3AF; }
      .info-list {
        background: #374151;

        li {
          border-color: #4B5563;

          span { color: #F3F4F6; }
        }
      }
    }
  `]
})
export class PremiumInfoDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<PremiumInfoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: InfoDialogData
  ) {}

  getDefaultIcon(): string {
    const icons: Record<string, string> = {
      info: 'info',
      success: 'check_circle',
      warning: 'warning',
      error: 'error'
    };
    return icons[this.data.type || 'info'];
  }

  close(): void {
    this.dialogRef.close();
  }
}
