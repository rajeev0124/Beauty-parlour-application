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
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-expense-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatDialogModule, MatFormFieldModule, 
    MatInputModule, MatSelectModule, MatButtonModule, MatDatepickerModule, MatNativeDateModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data ? 'Edit Expense' : 'Add Expense' }}</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Title</mat-label>
        <input matInput [(ngModel)]="expense.title" placeholder="e.g., Monthly Rent">
      </mat-form-field>

      <div class="row">
        <mat-form-field appearance="outline">
          <mat-label>Category</mat-label>
          <mat-select [(ngModel)]="expense.category">
            <mat-option value="rent">Rent</mat-option>
            <mat-option value="utilities">Utilities (Electricity, Water)</mat-option>
            <mat-option value="salary">Salary</mat-option>
            <mat-option value="supplies">Supplies</mat-option>
            <mat-option value="equipment">Equipment</mat-option>
            <mat-option value="marketing">Marketing</mat-option>
            <mat-option value="maintenance">Maintenance</mat-option>
            <mat-option value="other">Other</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Amount (₹)</mat-label>
          <input matInput type="number" [(ngModel)]="expense.amount">
        </mat-form-field>
      </div>

      <div class="row">
        <mat-form-field appearance="outline">
          <mat-label>Date</mat-label>
          <input matInput [matDatepicker]="picker" [(ngModel)]="expense.date">
          <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Payment Method</mat-label>
          <mat-select [(ngModel)]="expense.paymentMethod">
            <mat-option value="cash">Cash</mat-option>
            <mat-option value="card">Card</mat-option>
            <mat-option value="upi">UPI</mat-option>
            <mat-option value="bank_transfer">Bank Transfer</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Vendor/Payee</mat-label>
        <input matInput [(ngModel)]="expense.vendor" placeholder="e.g., Landlord Name">
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Description</mat-label>
        <textarea matInput [(ngModel)]="expense.description" rows="3"></textarea>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Cancel</button>
      <button mat-raised-button color="primary" (click)="save()" [disabled]="!isValid()">
        {{ data ? 'Update' : 'Add' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width { width: 100%; margin-bottom: 8px; }
    .row { display: flex; gap: 16px; }
    .row mat-form-field { flex: 1; }
  `]
})
export class ExpenseDialogComponent {
  expense: any = {
    title: '',
    category: 'other',
    amount: 0,
    date: new Date(),
    paymentMethod: 'cash',
    vendor: '',
    description: ''
  };

  constructor(
    public dialogRef: MatDialogRef<ExpenseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient
  ) {
    if (data) {
      this.expense = { ...data };
    }
  }

  isValid(): boolean {
    return this.expense.title && this.expense.category && this.expense.amount > 0;
  }

  save() {
    const url = this.data 
      ? `${environment.apiUrl}/expenses/${this.data._id}`
      : `${environment.apiUrl}/expenses`;
    
    const method = this.data ? 'put' : 'post';
    
    this.http[method](url, this.expense).subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => alert(err.error?.message || 'Error saving expense')
    });
  }
}
