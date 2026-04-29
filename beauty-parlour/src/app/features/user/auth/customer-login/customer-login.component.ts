import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-customer-login',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink,
    MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule
  ],
  templateUrl: './customer-login.component.html',
  styleUrl: './customer-login.component.scss'
})
export class CustomerLoginComponent {
  loginForm: FormGroup;
  hidePassword = true;
  loading = false;
  errorMessage = '';
  
  // Focus states for custom inputs
  emailFocused = false;
  passwordFocused = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    if (this.authService.isLoggedIn()) {
      const user = this.authService.getCurrentUser();
      if (user?.role === 'admin' || user?.role === 'superadmin') {
        this.router.navigate(['/admin/dashboard']);
      } else {
        this.router.navigate(['/']);
      }
    }

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';
    
    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.loading = false;
        const user = this.authService.getCurrentUser();
        if (user?.role === 'admin' || user?.role === 'superadmin') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.loading = false;
        // Better error message handling
        if (err.status === 0) {
          this.errorMessage = 'Unable to connect to server. Please check if backend is running.';
        } else if (err.status === 401) {
          this.errorMessage = err.error?.message || 'Invalid email or password';
        } else if (err.status === 403) {
          this.errorMessage = 'Account is blocked. Contact admin.';
        } else {
          this.errorMessage = err.error?.message || 'Login failed. Please try again.';
        }
      }
    });
  }

  fillDemo(customer: string = 'priya'): void {
    const customerEmails: Record<string, string> = {
      'priya': 'priya@gmail.com',
      'sneha': 'sneha@gmail.com',
      'anjali': 'anjali@gmail.com'
    };
    this.loginForm.setValue({ email: customerEmails[customer] || 'priya@gmail.com', password: 'customer123' });
  }

  showForgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }
}
