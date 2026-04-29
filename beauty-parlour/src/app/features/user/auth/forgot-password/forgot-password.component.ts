import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../../core/services/auth.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink,
    MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';
  emailSent = false;
  devResetLink = ''; // For development testing only
  isDev = !environment.production;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.devResetLink = '';

    this.authService.forgotPassword(this.forgotForm.value.email).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.emailSent = true;
        this.successMessage = res.message || 'If the email exists, a password reset link has been sent.';
        // In development, show the reset link directly
        if (this.isDev && res.devResetLink) {
          this.devResetLink = res.devResetLink;
        }
      },
      error: (err) => {
        this.loading = false;
        // Don't reveal if email exists or not for security
        this.emailSent = true;
        this.successMessage = 'If the email exists in our system, a password reset link has been sent.';
      }
    });
  }
}
