import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef, ViewEncapsulation, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, MatFormFieldModule,
    MatInputModule, MatIconModule,
    MatSlideToggleModule, MatSnackBarModule,
    MatProgressSpinnerModule, MatTooltipModule
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class SettingsComponent implements OnInit {
  activeTab = 'business';
  businessForm: FormGroup;
  notificationForm: FormGroup;
  passwordForm: FormGroup;
  
  savingBusiness = false;
  savingNotifications = false;
  savingPassword = false;
  
  twoFactorEnabled = false;
  showPasswordDialog = false;
  showSessionsDialog = false;
  
  activeSessions: any[] = [];
  currentUser: any;

  constructor(
    private fb: FormBuilder, 
    private snackBar: MatSnackBar,
    private userService: UserService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      console.warn('No current user found in settings');
    }
    this.twoFactorEnabled = this.currentUser?.is2FAEnabled || false;

    this.businessForm = this.fb.group({
      businessName: ['Beauty Parlour', Validators.required],
      email: [this.currentUser?.email || '', [Validators.required, Validators.email]],
      phone: [this.currentUser?.phone || '', Validators.required],
      address: [this.currentUser?.address || ''],
      openTime: ['09:00'],
      closeTime: ['21:00'],
    });

    this.notificationForm = this.fb.group({
      emailNotifications: [true],
      smsNotifications: [true],
      appointmentReminders: [true],
      promotionalEmails: [false],
    });

    this.passwordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    if (this.currentUser) {
      this.loadSessions();
    }
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  loadSessions(): void {
    if (!this.currentUser?._id) return;
    this.userService.getSessions(this.currentUser._id).subscribe({
      next: (res: any) => {
        // Handle both raw array and { sessions: [] } wrapper
        this.activeSessions = Array.isArray(res) ? res : (res.sessions || []);
        this.cdr.detectChanges();
      },
      error: () => this.snackBar.open('Error loading sessions', 'Close', { duration: 3000 })
    });
  }

  saveBusinessSettings(): void {
    if (this.businessForm.invalid) return;
    this.savingBusiness = true;
    this.userService.update(this.currentUser._id, this.businessForm.value).subscribe({
      next: (user) => {
        this.savingBusiness = false;
        this.authService.updateCurrentUser(user);
        this.snackBar.open('Business settings saved', 'Close', { duration: 3000 });
      },
      error: () => {
        this.savingBusiness = false;
        this.snackBar.open('Error saving settings', 'Close', { duration: 3000 });
      }
    });
  }

  resetBusinessForm(): void {
    this.businessForm.reset({
      businessName: this.currentUser?.businessName || 'Beauty Parlour',
      email: this.currentUser?.email || '',
      phone: this.currentUser?.phone || '',
      address: this.currentUser?.address || '',
      openTime: '09:00',
      closeTime: '21:00'
    });
  }

  getFormattedHours(): string {
    const openTime = this.businessForm.get('openTime')?.value;
    const closeTime = this.businessForm.get('closeTime')?.value;
    if (openTime && closeTime) {
      return `${openTime} - ${closeTime}`;
    }
    return '09:00 - 21:00';
  }

  saveNotificationSettings(): void {
    this.savingNotifications = true;
    setTimeout(() => {
      this.savingNotifications = false;
      this.snackBar.open('Notification settings saved', 'Close', { duration: 3000 });
    }, 800);
  }

  openPasswordChange(): void {
    this.showPasswordDialog = true;
    this.cdr.detectChanges();
  }

  closePasswordChange(): void {
    this.showPasswordDialog = false;
    this.passwordForm.reset();
  }

  submitPasswordChange(): void {
    if (this.passwordForm.invalid) return;
    this.savingPassword = true;
    this.userService.changePassword(this.passwordForm.value).subscribe({
      next: () => {
        this.savingPassword = false;
        this.closePasswordChange();
        this.snackBar.open('Password updated successfully', 'Close', { duration: 3000 });
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.savingPassword = false;
        this.snackBar.open(err.error?.message || 'Error updating password', 'Close', { duration: 3000 });
        this.cdr.detectChanges();
      }
    });
  }

  toggleTwoFactor(): void {
    if (!this.currentUser?._id) return;
    const newState = !this.twoFactorEnabled;
    this.userService.toggle2FA(this.currentUser._id, newState).subscribe({
      next: (user) => {
        this.twoFactorEnabled = user.is2FAEnabled || false;
        this.authService.updateCurrentUser(user);
        const action = this.twoFactorEnabled ? 'enabled' : 'disabled';
        this.snackBar.open(`Two-factor authentication ${action}`, 'Close', { duration: 3000 });
        this.cdr.detectChanges();
      },
      error: () => this.snackBar.open('Error toggling 2FA', 'Close', { duration: 3000 })
    });
  }

  viewActiveSessions(): void {
    this.showSessionsDialog = true;
    this.loadSessions();
    this.cdr.detectChanges();
  }

  closeSessions(): void {
    this.showSessionsDialog = false;
  }

  revokeSession(sessionId: string): void {
    this.userService.revokeSession(this.currentUser._id, sessionId).subscribe({
      next: (sessions) => {
        this.activeSessions = sessions;
        this.snackBar.open('Session revoked', 'Close', { duration: 3000 });
      },
      error: () => this.snackBar.open('Error revoking session', 'Close', { duration: 3000 })
    });
  }
}
