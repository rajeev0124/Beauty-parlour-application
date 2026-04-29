import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Product } from '../../core/models/product.model';
import { ProductService } from '../../core/services/product.service';

@Component({
  selector: 'app-product-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatFormFieldModule,
    MatInputModule, MatSelectModule,
    MatSlideToggleModule, MatIconModule, MatSnackBarModule
  ],
  templateUrl: './product-dialog.component.html'
})
export class ProductDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    public dialogRef: MatDialogRef<ProductDialogComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: Product | null
  ) {
    this.form = this.fb.group({
      name: [data?.name || '', Validators.required],
      category: [data?.category || '', Validators.required],
      price: [data?.price || '', [Validators.required, Validators.min(0)]],
      stock: [data?.stock || 0, [Validators.required, Validators.min(0)]],
      description: [data?.description || ''],
      isActive: [data?.isActive ?? true]
    });
  }

  save(): void {
    if (this.form.invalid) return;

    const obs = this.data
      ? this.productService.update(this.data._id, this.form.value)
      : this.productService.create(this.form.value);

    obs.subscribe({
      next: () => {
        this.snackBar.open('Product ' + (this.data ? 'updated' : 'created'), 'Close', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: () => this.snackBar.open('Operation failed', 'Close', { duration: 3000 })
    });
  }
}
