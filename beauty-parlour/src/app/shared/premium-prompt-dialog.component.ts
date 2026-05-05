import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface PromptDialogData {
  title: string;
  message?: string;
  placeholder?: string;
  defaultValue?: string;
  inputType?: 'text' | 'number' | 'email' | 'password' | 'textarea';
  confirmText?: string;
  cancelText?: string;
  icon?: string;
  type?: 'default' | 'success' | 'warning' | 'info';
  required?: boolean;
  minValue?: number;
  maxValue?: number;
}

@Component({
  selector: 'app-premium-prompt-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div style="padding: 28px 32px; text-align: center; min-width: 360px; max-width: 420px; background: white; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; opacity: 1 !important; visibility: visible !important;">
      <!-- Icon -->
      <div [style.background]="getIconBg()" style="width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
        <mat-icon [style.color]="getIconColor()" style="font-size: 32px; width: 32px; height: 32px;">{{ data.icon || getDefaultIcon() }}</mat-icon>
      </div>
      
      <!-- Title -->
      <h2 style="font-size: 20px; font-weight: 700; color: #1F2937; margin: 0 0 8px;">{{ data.title }}</h2>
      
      <!-- Message -->
      <p *ngIf="data.message" style="font-size: 14px; color: #6B7280; line-height: 1.5; margin: 0 0 20px;">{{ data.message }}</p>
      
      <!-- Input -->
      <div style="margin-bottom: 24px;">
        <textarea 
          *ngIf="data.inputType === 'textarea'"
          [(ngModel)]="inputValue"
          [placeholder]="data.placeholder || 'Enter here...'"
          rows="4"
          style="width: 100%; padding: 14px 16px; font-size: 15px; font-family: inherit; color: #1F2937; background: #F9FAFB; border: 2px solid #E5E7EB; border-radius: 12px; outline: none; box-sizing: border-box; resize: vertical; min-height: 80px;"
        ></textarea>
        <input 
          *ngIf="data.inputType !== 'textarea'"
          [type]="data.inputType || 'text'"
          [(ngModel)]="inputValue"
          [placeholder]="data.placeholder || 'Enter here...'"
          [attr.min]="data.minValue"
          [attr.max]="data.maxValue"
          (keydown.enter)="confirm()"
          style="width: 100%; padding: 14px 16px; font-size: 15px; font-family: inherit; color: #1F2937; background: #F9FAFB; border: 2px solid #E5E7EB; border-radius: 12px; outline: none; box-sizing: border-box;"
        />
      </div>
      
      <!-- Buttons -->
      <div style="display: flex; gap: 12px; justify-content: center;">
        <button (click)="cancel()" style="display: inline-flex; align-items: center; justify-content: center; padding: 12px 24px; border-radius: 10px; font-size: 14px; font-weight: 600; border: none; cursor: pointer; min-width: 110px; background: #F3F4F6; color: #6B7280;">
          {{ data.cancelText || 'Cancel' }}
        </button>
        <button 
          [disabled]="data.required && !hasValue()"
          (click)="confirm()"
          [style.background]="getBtnBg()"
          [style.opacity]="data.required && !hasValue() ? '0.5' : '1'"
          style="display: inline-flex; align-items: center; justify-content: center; padding: 12px 24px; border-radius: 10px; font-size: 14px; font-weight: 600; border: none; cursor: pointer; min-width: 110px; color: white; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);"
        >
          {{ data.confirmText || 'Confirm' }}
        </button>
      </div>
    </div>
  `
})
export class PremiumPromptDialogComponent {
  inputValue: string;

  constructor(
    public dialogRef: MatDialogRef<PremiumPromptDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PromptDialogData
  ) {
    this.inputValue = data.defaultValue || '';
  }

  getIconBg(): string {
    const bgs: Record<string, string> = {
      default: 'linear-gradient(135deg, #EDE9FE, #DDD6FE)',
      success: 'linear-gradient(135deg, #D1FAE5, #A7F3D0)',
      warning: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
      info: 'linear-gradient(135deg, #DBEAFE, #BFDBFE)'
    };
    return bgs[this.data.type || 'default'];
  }

  getIconColor(): string {
    const colors: Record<string, string> = {
      default: '#7C3AED',
      success: '#059669',
      warning: '#D97706',
      info: '#2563EB'
    };
    return colors[this.data.type || 'default'];
  }

  getBtnBg(): string {
    const bgs: Record<string, string> = {
      default: 'linear-gradient(135deg, #7C3AED, #9333EA)',
      success: 'linear-gradient(135deg, #059669, #10B981)',
      warning: 'linear-gradient(135deg, #D97706, #F59E0B)',
      info: 'linear-gradient(135deg, #2563EB, #3B82F6)'
    };
    return bgs[this.data.type || 'default'];
  }

  getDefaultIcon(): string {
    const icons: Record<string, string> = {
      default: 'edit',
      success: 'check_circle',
      warning: 'warning',
      info: 'info'
    };
    return icons[this.data.type || 'default'];
  }

  hasValue(): boolean {
    return !!this.inputValue && this.inputValue.trim().length > 0;
  }

  confirm(): void {
    if (this.data.required && !this.hasValue()) return;
    this.dialogRef.close(this.inputValue);
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}
