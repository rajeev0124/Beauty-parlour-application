import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AuthService } from '../../../core/services/auth.service';
import { WakeupService } from '../../../core/services/wakeup.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatSnackBarModule,
    MatProgressSpinnerModule, MatProgressBarModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  hidePassword = true;
  loading = false;
  errorMessage = '';
  serverWaking = false;
  serverElapsed = 0;

  // Focus states for custom inputs
  emailFocused = false;
  passwordFocused = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    public wakeupService: WakeupService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.wakeupService.status$.subscribe(status => {
      this.serverWaking = status === 'waking';
    });
    this.wakeupService.elapsedSeconds$.subscribe(s => {
      this.serverElapsed = s;
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

  fillDemo(type: 'admin' | 'superadmin'): void {
    if (type === 'admin') {
      this.loginForm.setValue({ email: 'admin@beauty.com', password: 'admin123' });
    } else {
      this.loginForm.setValue({ email: 'superadmin@beauty.com', password: 'super123' });
    }
  }

  // Note: Admin credentials are stored with role='admin' or 'superadmin' in MongoDB users collection
}
