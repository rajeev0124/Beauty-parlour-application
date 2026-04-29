import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Service } from '../../core/models/service.model';
import { ServiceService } from '../../core/services/service.service';

@Component({
  selector: 'app-service-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatFormFieldModule,
    MatInputModule, MatSelectModule,
    MatSlideToggleModule, MatIconModule, MatSnackBarModule
  ],
  templateUrl: './service-dialog.component.html'
})
export class ServiceDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private serviceService: ServiceService,
    public dialogRef: MatDialogRef<ServiceDialogComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: Service | null
  ) {
    this.form = this.fb.group({
      name: [data?.name || '', Validators.required],
      category: [data?.category || '', Validators.required],
      price: [data?.price || '', [Validators.required, Validators.min(0)]],
      duration: [data?.duration || '', [Validators.required, Validators.min(1)]],
      description: [data?.description || ''],
      isActive: [data?.isActive ?? true]
    });
  }

  save(): void {
    if (this.form.invalid) return;

    // Ensure proper types before sending
    const formData = {
      ...this.form.value,
      price: Number(this.form.value.price),
      duration: Number(this.form.value.duration),
      description: this.form.value.description || ''
    };

    console.log('Sending service data:', formData);

    const obs = this.data
      ? this.serviceService.update(this.data._id, formData)
      : this.serviceService.create(formData);

    obs.subscribe({
      next: (res) => {
        console.log('Service saved successfully:', res);
        this.snackBar.open('Service ' + (this.data ? 'updated' : 'created'), 'Close', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Service operation failed:', err);
        const errorMsg = err.error?.message || err.message || 'Operation failed';
        this.snackBar.open(errorMsg, 'Close', { duration: 5000 });
      }
    });
  }
}
