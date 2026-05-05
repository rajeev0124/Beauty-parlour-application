import { Component, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-customer-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, RouterLink,
    MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule
  ],
  templateUrl: './customer-login.component.html',
  styleUrl: './customer-login.component.scss',
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('stepAnimation', [
      state('email', style({ transform: 'translateX(0)', opacity: 1 })),
      state('password', style({ transform: 'translateX(0)', opacity: 1 })),
      transition('email => password', [
        style({ transform: 'translateX(0)', opacity: 1 }),
        animate('300ms ease-out', style({ transform: 'translateX(-100%)', opacity: 0 }))
      ]),
      transition('password => email', [
        style({ transform: 'translateX(0)', opacity: 1 }),
        animate('300ms ease-out', style({ transform: 'translateX(100%)', opacity: 0 }))
      ])
    ])
  ]
})
export class CustomerLoginComponent {
  // Multi-step state
  currentStep: 'email' | 'password' = 'email';
  userEmail = '';
  
  // Forms for each step
  emailForm: FormGroup;
  passwordForm: FormGroup;
  
  hidePassword = true;
  loading = false;
  errorMessage = '';
  
  // Focus states
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

    // Step 1: Email form
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
    
    // Step 2: Password form
    this.passwordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // Proceed to password step
  onEmailNext(): void {
    if (this.emailForm.invalid) return;
    
    this.userEmail = this.emailForm.value.email;
    this.errorMessage = '';
    this.currentStep = 'password';
    
    // Focus password field after transition
    setTimeout(() => {
      const passwordInput = document.getElementById('password');
      if (passwordInput) passwordInput.focus();
    }, 350);
  }

  // Go back to email step
  goBackToEmail(): void {
    this.currentStep = 'email';
    this.errorMessage = '';
    this.passwordForm.reset();
    
    setTimeout(() => {
      const emailInput = document.getElementById('email');
      if (emailInput) emailInput.focus();
    }, 350);
  }

  // Final login submit
  onPasswordSubmit(): void {
    if (this.passwordForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';
    
    const credentials = {
      email: this.userEmail,
      password: this.passwordForm.value.password
    };
    
    this.authService.login(credentials).subscribe({
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

  showForgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }
}
