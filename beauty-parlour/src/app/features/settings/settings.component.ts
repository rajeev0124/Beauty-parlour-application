import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatFormFieldModule,
    MatInputModule, MatIconModule,
    MatSlideToggleModule, MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  activeTab = 'business';
  businessForm: FormGroup;
  notificationForm: FormGroup;
  savingBusiness = false;
  savingNotifications = false;

  constructor(private fb: FormBuilder, private snackBar: MatSnackBar) {
    this.businessForm = this.fb.group({
      businessName: ['Beauty Parlour'],
      email: ['admin@beautyparlour.com'],
      phone: ['9876543210'],
      address: ['123, Main Street, City'],
      openTime: ['09:00'],
      closeTime: ['21:00'],
    });

    this.notificationForm = this.fb.group({
      emailNotifications: [true],
      smsNotifications: [true],
      appointmentReminders: [true],
      promotionalEmails: [false],
    });
  }

  saveBusinessSettings(): void {
    this.savingBusiness = true;
    setTimeout(() => {
      this.savingBusiness = false;
      this.snackBar.open('Business settings saved', 'Close', { duration: 3000 });
    }, 800);
  }

  saveNotificationSettings(): void {
    this.savingNotifications = true;
    setTimeout(() => {
      this.savingNotifications = false;
      this.snackBar.open('Notification settings saved', 'Close', { duration: 3000 });
    }, 800);
  }
}
