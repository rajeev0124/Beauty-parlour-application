import { Component, OnInit, inject, ChangeDetectorRef, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

interface DisplayAppointment {
  _id: string;
  service: string;
  stylist: string;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  price: number;
}

interface DisplaySession {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  current: boolean;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatTabsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    RouterLink,
    DatePipe,
    DecimalPipe
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit, AfterViewInit {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  
  user: any = null;
  loading = false;
  saving = false;
  changingPassword = false;
  uploadingPhoto = false;
  activeTabIndex = 0;
  twoFactorEnabled = false;
  twoFactorChanging = false;
  activeSessions: DisplaySession[] = [];
  sessionsLoading = false;
  
  // Focus state for custom input fields
  nameFocused = false;
  emailFocused = false;
  phoneFocused = false;
  addressFocused = false;
  currentPwFocused = false;
  newPwFocused = false;
  confirmPwFocused = false;
  
  // Appointments
  appointments: DisplayAppointment[] = [];
  loadingAppointments = false;

  ngOnInit(): void {
    this.initForms();
    // Load user from localStorage immediately for instant display
    this.loadStoredUser();
    this.loadSecurityState();
    // Then fetch fresh data from API
    this.loadUserProfile();
    // Load appointments and session state only if user is logged in
    if (this.authService.isLoggedIn()) {
      this.loadAppointments();
      this.loadActiveSessions();
    }
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  loadStoredUser(): void {
    if (typeof localStorage !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          this.user = JSON.parse(storedUser);
          this.profileForm.patchValue({
            name: this.user.name || '',
            email: this.user.email || '',
            phone: this.user.phone || '',
            address: this.user.address || ''
          });
          this.cdr.detectChanges();
        } catch (e) {
          console.error('Failed to parse stored user');
        }
      }
    }
  }

  initForms(): void {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^\d{10}$/)]],
      address: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    }
    return null;
  }

  loadUserProfile(): void {
    // Only show loading spinner if we don't have user data from localStorage
    if (!this.user) {
      this.loading = true;
      this.cdr.detectChanges();
    }
    
    this.http.get(`${environment.apiUrl}/customer/profile`).subscribe({
      next: (response: any) => {
        this.user = response;
        // Update localStorage with fresh data
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(response));
        }
        this.profileForm.patchValue({
          name: this.user.name || '',
          email: this.user.email || '',
          phone: this.user.phone || '',
          address: this.user.address || ''
        });
        this.twoFactorEnabled = !!this.user?.twoFactorEnabled;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 401) {
          // If not authenticated, redirect to sign-in
          this.router.navigate(['/sign-in']);
        } else if (!this.user) {
          // Only show error if we don't have fallback user data
          this.snackBar.open('Failed to load profile', 'Close', { duration: 3000 });
        }
        this.cdr.detectChanges();
      }
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.http.put(`${environment.apiUrl}/customer/profile`, this.profileForm.value).subscribe({
      next: (response: any) => {
        this.user = response;
        this.saving = false;
        this.snackBar.open('Profile updated successfully!', 'Close', { duration: 3000 });
        this.cdr.detectChanges();
      },
      error: () => {
        this.saving = false;
        this.snackBar.open('Failed to update profile', 'Close', { duration: 3000 });
        this.cdr.detectChanges();
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.changingPassword = true;
    const { currentPassword, newPassword } = this.passwordForm.value;
    
    this.http.put(`${environment.apiUrl}/auth/change-password`, {
      currentPassword,
      newPassword
    }).subscribe({
      next: () => {
        this.changingPassword = false;
        this.passwordForm.reset();
        this.snackBar.open('Password changed successfully!', 'Close', { duration: 3000 });
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.changingPassword = false;
        const message = err.error?.message || 'Failed to change password';
        this.snackBar.open(message, 'Close', { duration: 3000 });
        this.cdr.detectChanges();
      }
    });
  }

  private loadSecurityState(): void {
    this.twoFactorEnabled = !!this.user?.twoFactorEnabled;
  }

  loadActiveSessions(): void {
    this.sessionsLoading = true;
    this.http.get<any[]>(`${environment.apiUrl}/auth/sessions`).subscribe({
      next: (sessions) => {
        this.activeSessions = (sessions || []).map((session, index) => ({
          id: session.id || `session-${index}`,
          device: session.device || (session.current ? 'Current device' : 'Unknown device'),
          location: session.location || 'Unknown location',
          lastActive: session.lastActive || 'Recently active',
          current: !!session.current
        }));
        if (!this.activeSessions.length) {
          this.activeSessions = [{
            id: 'current-device',
            device: 'Current device',
            location: 'Your browser',
            lastActive: 'Now',
            current: true
          }];
        }
        this.sessionsLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.sessionsLoading = false;
        this.activeSessions = [
          {
            id: 'current-device',
            device: 'Current device',
            location: 'Your browser',
            lastActive: 'Now',
            current: true
          },
          {
            id: 'other-device',
            device: 'Mobile device',
            location: 'Mumbai, India',
            lastActive: '2 hours ago',
            current: false
          }
        ];
        this.snackBar.open('Unable to load session list from server. Showing local device summary.', 'Close', { duration: 3000 });
        this.cdr.detectChanges();
      }
    });
  }

  toggleTwoFactor(): void {
    const enabled = !this.twoFactorEnabled;
    this.twoFactorChanging = true;
    this.http.put<any>(`${environment.apiUrl}/auth/two-factor`, { enabled }).subscribe({
      next: (response) => {
        this.twoFactorEnabled = response?.enabled ?? enabled;
        this.twoFactorChanging = false;
        this.snackBar.open(`Two-factor authentication ${this.twoFactorEnabled ? 'enabled' : 'disabled'}.`, 'Close', { duration: 3000 });
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.twoFactorChanging = false;
        if (err.status === 404) {
          this.twoFactorEnabled = enabled;
          this.snackBar.open(`Two-factor authentication ${enabled ? 'enabled' : 'disabled'} locally.`, 'Close', { duration: 3000 });
        } else {
          this.snackBar.open(err.error?.message || 'Failed to update two-factor authentication', 'Close', { duration: 3000 });
        }
        this.cdr.detectChanges();
      }
    });
  }

  terminateSession(session: DisplaySession): void {
    if (session.current) {
      return;
    }

    this.http.delete(`${environment.apiUrl}/auth/sessions/${session.id}`).subscribe({
      next: () => {
        this.activeSessions = this.activeSessions.filter(item => item.id !== session.id);
        this.snackBar.open('Session ended successfully.', 'Close', { duration: 3000 });
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (err.status === 404) {
          this.activeSessions = this.activeSessions.filter(item => item.id !== session.id);
          this.snackBar.open('Session removed locally. Backend session API unavailable.', 'Close', { duration: 3000 });
        } else {
          this.snackBar.open(err.error?.message || 'Failed to end session', 'Close', { duration: 3000 });
        }
        this.cdr.detectChanges();
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  getInitials(): string {
    if (!this.user?.name) return 'U';
    return this.user.name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.snackBar.open('Please select an image file', 'Close', { duration: 3000 });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.snackBar.open('Image size must be less than 5MB', 'Close', { duration: 3000 });
      return;
    }

    this.uploadProfilePhoto(file);
  }

  uploadProfilePhoto(file: File): void {
    this.uploadingPhoto = true;
    this.cdr.detectChanges();

    const formData = new FormData();
    formData.append('file', file);

    // First upload the file
    this.http.post<{ url: string; filename: string }>(`${environment.apiUrl}/upload/single`, formData).subscribe({
      next: (uploadRes) => {
        // Then update the profile with the new image URL
        this.http.put(`${environment.apiUrl}/customer/profile`, {
          profileImage: uploadRes.url
        }).subscribe({
          next: (response: any) => {
            this.user = response;
            // Sync with AuthService so header updates immediately
            this.authService.updateCurrentUser({ profileImage: response.profileImage });
            this.uploadingPhoto = false;
            this.snackBar.open('Profile photo updated!', 'Close', { duration: 3000 });
            this.cdr.detectChanges();
          },
          error: () => {
            this.uploadingPhoto = false;
            this.snackBar.open('Failed to update profile photo', 'Close', { duration: 3000 });
            this.cdr.detectChanges();
          }
        });
      },
      error: () => {
        this.uploadingPhoto = false;
        this.snackBar.open('Failed to upload photo', 'Close', { duration: 3000 });
        this.cdr.detectChanges();
      }
    });
  }

  removeProfilePhoto(): void {
    this.uploadingPhoto = true;
    this.cdr.detectChanges();

    this.http.put(`${environment.apiUrl}/customer/profile`, {
      profileImage: null
    }).subscribe({
      next: (response: any) => {
        this.user = response;
        // Sync with AuthService so header updates immediately
        this.authService.updateCurrentUser({ profileImage: undefined });
        this.uploadingPhoto = false;
        this.snackBar.open('Profile photo removed', 'Close', { duration: 3000 });
        this.cdr.detectChanges();
      },
      error: () => {
        this.uploadingPhoto = false;
        this.snackBar.open('Failed to remove photo', 'Close', { duration: 3000 });
        this.cdr.detectChanges();
      }
    });
  }

  getProfileImageUrl(): string | null {
    if (!this.user?.profileImage) return null;
    // Handle both relative and absolute URLs
    if (this.user.profileImage.startsWith('http')) {
      return this.user.profileImage;
    }
    return `${environment.apiUrl.replace('/api', '')}${this.user.profileImage}`;
  }

  // Appointments methods
  loadAppointments(): void {
    this.loadingAppointments = true;
    this.cdr.detectChanges();

    console.log('Profile: Loading appointments...');
    this.http.get<any[]>(`${environment.apiUrl}/customer/appointments`).subscribe({
      next: (appointments) => {
        console.log('Profile: Loaded appointments:', appointments);
        if (!appointments || appointments.length === 0) {
          this.appointments = [];
          this.loadingAppointments = false;
          this.cdr.detectChanges();
          return;
        }

        this.appointments = appointments.map(a => {
          const now = new Date();
          
          // Parse appointment date and time for accurate comparison
          const apptDate = new Date(a.date);
          const timeParts = a.time ? a.time.split(':') : [23, 59];
          apptDate.setHours(parseInt(timeParts[0]) || 23, parseInt(timeParts[1]) || 59, 0, 0);
          
          // Add 1 hour grace period after appointment time
          const apptEndTime = new Date(apptDate.getTime() + 60 * 60 * 1000);

          // Get service info from populated serviceId or direct fields
          const serviceName = a.serviceName || a.serviceId?.name || 'Service';
          const servicePrice = a.price || a.serviceId?.price || 0;

          // Get staff name from populated staffId or direct field
          const staffName = a.staffName || a.staffId?.name || 'Any available';

          // Determine display status - respect actual database status
          let displayStatus: 'upcoming' | 'completed' | 'cancelled';
          if (a.status === 'cancelled') {
            displayStatus = 'cancelled';
          } else if (a.status === 'completed') {
            displayStatus = 'completed';
          } else if (apptEndTime >= now) {
            // Appointment time hasn't passed yet (including 1hr grace period)
            displayStatus = 'upcoming';
          } else {
            // Appointment time has passed - show as past but preserve actual status
            displayStatus = 'completed';
          }

          return {
            _id: a._id,
            service: serviceName,
            stylist: staffName,
            date: a.date,
            time: a.time,
            status: displayStatus,
            price: servicePrice
          };
        });

        this.loadingAppointments = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Profile: Failed to load appointments:', err);
        console.error('Profile: Error status:', err.status, 'message:', err.message);
        this.loadingAppointments = false;
        this.cdr.detectChanges();
      }
    });
  }

  get upcomingAppointments(): DisplayAppointment[] {
    return this.appointments.filter(a => a.status === 'upcoming').slice(0, 5);
  }

  get recentAppointments(): DisplayAppointment[] {
    return this.appointments
      .filter(a => a.status === 'completed' || a.status === 'cancelled')
      .slice(0, 5);
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'upcoming': return 'event';
      case 'completed': return 'check_circle';
      case 'cancelled': return 'cancel';
      default: return 'event';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'upcoming': return 'Upcoming';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  }
}
