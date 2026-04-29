import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface CouponFormData {
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscount: number | null;
  startDate: Date;
  endDate: Date;
  maxUsage: number | null;
  applicableOn: string[];
}

@Component({
  selector: 'app-coupon-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatDialogModule, MatFormFieldModule, 
    MatInputModule, MatSelectModule, MatButtonModule, MatDatepickerModule, 
    MatNativeDateModule, MatSnackBarModule, MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data ? 'Edit Coupon' : 'Create Coupon' }}</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Coupon Code</mat-label>
        <input matInput [(ngModel)]="coupon.code" placeholder="e.g., SUMMER20" [disabled]="!!data" required>
        <mat-hint>Unique code for the coupon (auto-uppercased)</mat-hint>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Description</mat-label>
        <input matInput [(ngModel)]="coupon.description" placeholder="e.g., Summer Sale 20% Off" required>
      </mat-form-field>

      <div class="row">
        <mat-form-field appearance="outline">
          <mat-label>Discount Type</mat-label>
          <mat-select [(ngModel)]="coupon.discountType" required>
            <mat-option value="percentage">Percentage (%)</mat-option>
            <mat-option value="fixed">Fixed Amount (₹)</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Discount Value</mat-label>
          <input matInput type="number" [(ngModel)]="coupon.discountValue" [min]="1" [max]="coupon.discountType === 'percentage' ? 100 : 99999" required>
          <mat-hint>{{ coupon.discountType === 'percentage' ? 'Enter 1-100' : 'Enter amount in ₹' }}</mat-hint>
        </mat-form-field>
      </div>

      <div class="row">
        <mat-form-field appearance="outline">
          <mat-label>Min Order Amount</mat-label>
          <input matInput type="number" [(ngModel)]="coupon.minOrderAmount" [min]="0">
          <mat-hint>Minimum cart value required</mat-hint>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Max Discount</mat-label>
          <input matInput type="number" [(ngModel)]="coupon.maxDiscount" placeholder="For percentage type">
          <mat-hint>Cap on discount amount</mat-hint>
        </mat-form-field>
      </div>

      <div class="row">
        <mat-form-field appearance="outline">
          <mat-label>Start Date</mat-label>
          <input matInput [matDatepicker]="startPicker" [(ngModel)]="coupon.startDate" required>
          <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
          <mat-datepicker #startPicker></mat-datepicker>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>End Date</mat-label>
          <input matInput [matDatepicker]="endPicker" [(ngModel)]="coupon.endDate" [min]="coupon.startDate" required>
          <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
          <mat-datepicker #endPicker></mat-datepicker>
          @if (coupon.endDate && coupon.startDate && coupon.endDate < coupon.startDate) {
            <mat-error>End date must be after start date</mat-error>
          }
        </mat-form-field>
      </div>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Max Usage (Leave empty for unlimited)</mat-label>
        <input matInput type="number" [(ngModel)]="coupon.maxUsage" [min]="1">
        <mat-hint>Total times this coupon can be used</mat-hint>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Applicable On</mat-label>
        <mat-select [(ngModel)]="coupon.applicableOn" multiple required>
          <mat-option value="all">All</mat-option>
          <mat-option value="service">Services</mat-option>
          <mat-option value="product">Products</mat-option>
        </mat-select>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()" [disabled]="saving">Cancel</button>
      <button mat-raised-button color="primary" (click)="save()" [disabled]="!isValid() || saving">
        @if (saving) {
          <mat-spinner diameter="20"></mat-spinner>
        } @else {
          {{ data ? 'Update' : 'Create' }}
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width { width: 100%; margin-bottom: 8px; }
    .row { display: flex; gap: 16px; }
    .row mat-form-field { flex: 1; }
    mat-dialog-actions button mat-spinner { display: inline-block; margin-right: 8px; }
  `]
})
export class CouponDialogComponent {
  saving = false;
  coupon: CouponFormData = {
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 0,
    maxDiscount: null,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    maxUsage: null,
    applicableOn: ['all']
  };

  constructor(
    public dialogRef: MatDialogRef<CouponDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CouponFormData | null,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    if (data) {
      this.coupon = { 
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate)
      };
    }
  }

  isValid(): boolean {
    const { code, description, discountValue, discountType, startDate, endDate, applicableOn } = this.coupon;
    
    if (!code?.trim() || !description?.trim()) return false;
    if (discountValue <= 0) return false;
    if (discountType === 'percentage' && discountValue > 100) return false;
    if (!startDate || !endDate) return false;
    if (new Date(endDate) < new Date(startDate)) return false;
    if (!applicableOn || applicableOn.length === 0) return false;
    
    return true;
  }

  save() {
    if (!this.isValid() || this.saving) return;
    
    this.saving = true;
    const url = this.data 
      ? `${environment.apiUrl}/coupons/${(this.data as any)._id}`
      : `${environment.apiUrl}/coupons`;
    
    const method = this.data ? 'put' : 'post';
    
    this.http[method](url, this.coupon).subscribe({
      next: () => {
        this.saving = false;
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.saving = false;
        this.snackBar.open(err.error?.message || 'Error saving coupon', 'Close', { duration: 4000 });
      }
    });
  }
}
