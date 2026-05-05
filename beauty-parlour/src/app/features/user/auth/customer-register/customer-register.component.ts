import { Component, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-customer-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, RouterLink,
    MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './customer-register.component.html',
  styleUrl: './customer-register.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class CustomerRegisterComponent {
  // Multi-step state
  currentStep: 'name' | 'contact' | 'password' = 'name';
  
  // Forms for each step
  nameForm: FormGroup;
  contactForm: FormGroup;
  passwordForm: FormGroup;
  
  hidePassword = true;
  hideConfirmPassword = true;
  loading = false;
  errorMessage = '';
  
  // Focus states
  nameFocused = false;
  emailFocused = false;
  phoneFocused = false;
  passwordFocused = false;
  confirmPasswordFocused = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
    }

    // Step 1: Name
    this.nameForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]]
    });
    
    // Step 2: Email & Phone
    this.contactForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]]
    });
    
    // Step 3: Password
    this.passwordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  // Custom validator for password match
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  // Get full name for display
  get userName(): string {
    return this.nameForm.value.name || '';
  }
  
  // Get email for display
  get userEmail(): string {
    return this.contactForm.value.email || '';
  }

  // Navigate to next step
  goToStep(step: 'name' | 'contact' | 'password'): void {
    this.errorMessage = '';
    this.currentStep = step;
    
    // Focus first input after transition
    setTimeout(() => {
      let inputId = '';
      if (step === 'name') inputId = 'name';
      else if (step === 'contact') inputId = 'email';
      else if (step === 'password') inputId = 'password';
      
      const input = document.getElementById(inputId);
      if (input) input.focus();
    }, 350);
  }

  // Step 1: Name Next
  onNameNext(): void {
    if (this.nameForm.invalid) return;
    this.goToStep('contact');
  }

  // Step 2: Contact Next
  onContactNext(): void {
    if (this.contactForm.invalid) return;
    this.goToStep('password');
  }

  // Final submit
  onSubmit(): void {
    if (this.passwordForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';
    
    const formData = {
      name: this.nameForm.value.name,
      email: this.contactForm.value.email,
      phone: this.contactForm.value.phone,
      password: this.passwordForm.value.password
    };
    
    this.authService.registerCustomer(formData).subscribe({
      next: () => {
        this.loading = false;
        this.snackBar.open('Account created successfully!', 'Close', { duration: 3000 });
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 0) {
          this.errorMessage = 'Unable to connect to server. Please check if backend is running.';
        } else if (err.status === 409) {
          this.errorMessage = 'Email already registered. Please use a different email or sign in.';
          // Go back to contact step to fix email
          this.goToStep('contact');
        } else if (err.status === 400) {
          this.errorMessage = err.error?.message || 'Invalid input. Please check your details.';
        } else {
          this.errorMessage = err.error?.message || 'Registration failed. Please try again.';
        }
      }
    });
  }
}
