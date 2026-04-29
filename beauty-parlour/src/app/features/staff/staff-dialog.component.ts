import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Staff } from '../../core/models/staff.model';
import { StaffService } from '../../core/services/staff.service';

@Component({
  selector: 'app-staff-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatFormFieldModule,
    MatInputModule, MatSelectModule,
    MatSlideToggleModule, MatIconModule, MatSnackBarModule
  ],
  templateUrl: './staff-dialog.component.html'
})
export class StaffDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private staffService: StaffService,
    public dialogRef: MatDialogRef<StaffDialogComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: Staff | null
  ) {
    this.form = this.fb.group({
      name: [data?.name || '', Validators.required],
      role: [data?.role || '', Validators.required],
      phone: [data?.phone || '', Validators.required],
      email: [data?.email || ''],
      specialization: [data?.specialization || ''],
      availability: [data?.availability ?? true]
    });
  }

  save(): void {
    if (this.form.invalid) return;

    const obs = this.data
      ? this.staffService.update(this.data._id, this.form.value)
      : this.staffService.create(this.form.value);

    obs.subscribe({
      next: () => {
        this.snackBar.open('Staff ' + (this.data ? 'updated' : 'created'), 'Close', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: () => this.snackBar.open('Operation failed', 'Close', { duration: 3000 })
    });
  }
}
