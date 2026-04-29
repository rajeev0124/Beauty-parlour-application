import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-add-stock-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Add Stock</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Select Product</mat-label>
        <mat-select [(ngModel)]="selectedProduct">
          @for (product of data.products; track product._id) {
            <mat-option [value]="product._id">{{ product.name }} (Current: {{ product.stock }})</mat-option>
          }
        </mat-select>
      </mat-form-field>
      
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Quantity to Add</mat-label>
        <input matInput type="number" [(ngModel)]="quantity" min="1">
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Cancel</button>
      <button mat-raised-button color="primary" (click)="addStock()" [disabled]="!selectedProduct || !quantity">
        Add Stock
      </button>
    </mat-dialog-actions>
  `,
  styles: [`.full-width { width: 100%; margin-bottom: 16px; }`]
})
export class AddStockDialogComponent {
  selectedProduct = '';
  quantity = 10;

  constructor(
    public dialogRef: MatDialogRef<AddStockDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { products: any[] },
    private http: HttpClient
  ) {}

  addStock() {
    this.http.post(`${environment.apiUrl}/inventory/add-stock`, {
      productId: this.selectedProduct,
      quantity: this.quantity
    }).subscribe({
      next: () => this.dialogRef.close(true),
      error: () => this.dialogRef.close(false)
    });
  }
}
