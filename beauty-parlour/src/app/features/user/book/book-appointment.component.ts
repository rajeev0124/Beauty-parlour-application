import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ServiceService } from '../../../core/services/service.service';
import { StaffService } from '../../../core/services/staff.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AuthService } from '../../../core/services/auth.service';
import { Service } from '../../../core/models/service.model';
import { Staff } from '../../../core/models/staff.model';

@Component({
  selector: 'app-book-appointment',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink, DatePipe,
    MatIconModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatDatepickerModule, MatNativeDateModule,
    MatButtonModule, MatSnackBarModule, MatProgressSpinnerModule
  ],
  templateUrl: './book-appointment.component.html',
  styleUrl: './book-appointment.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class BookAppointmentComponent implements OnInit {
  step = 1;
  bookingForm: FormGroup;
  submitted = false;
  submitting = false;
  loadingData = true;
  isLoggedIn = false;

  services: Service[] = [];
  stylists: Staff[] = [];

  timeSlots = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
    '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM',
    '7:00 PM', '7:30 PM', '8:00 PM'
  ];

  // Set minDate to start of today (midnight) to avoid time-based change detection issues
  minDate: Date;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router,
    private serviceService: ServiceService,
    private staffService: StaffService,
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    // Initialize minDate to today at midnight
    const today = new Date();
    this.minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    this.isLoggedIn = this.authService.isLoggedIn();
    const user = this.authService.getCurrentUser();
    this.bookingForm = this.fb.group({
      service: ['', Validators.required],
      stylist: [''],
      date: ['', Validators.required],
      time: ['', Validators.required],
      name: [user?.name || '', Validators.required],
      phone: [user?.phone || '', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      email: [user?.email || '', [Validators.required, Validators.email]],
      notes: [''],
    });
  }

  ngOnInit(): void {
    this.serviceService.getAll().subscribe({
      next: (services) => {
        this.services = services;
        this.loadingData = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loadingData = false;
        this.cdr.markForCheck();
      }
    });
    this.staffService.getAll().subscribe({
      next: (staff) => {
        this.stylists = staff;
        this.cdr.markForCheck();
      }
    });
  }

  get selectedService(): Service | undefined {
    return this.services.find(s => s.name === this.bookingForm.get('service')?.value);
  }

  nextStep(): void {
    if (this.step === 1) {
      if (this.bookingForm.get('service')?.valid && this.bookingForm.get('date')?.valid && this.bookingForm.get('time')?.valid) {
        this.step = 2;
        this.cdr.markForCheck();
      }
    }
  }

  prevStep(): void {
    this.step = 1;
    this.cdr.markForCheck();
  }

  submit(): void {
    if (this.bookingForm.invalid) return;

    this.submitting = true;
    this.cdr.markForCheck();
    
    const formVal = this.bookingForm.value;
    const user = this.authService.getCurrentUser();
    const selectedSvc = this.selectedService;
    const selectedStaff = this.stylists.find(s => s.name === formVal.stylist);

    // Format date to YYYY-MM-DD for backend compatibility
    const dateObj = new Date(formVal.date);
    const formattedDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;

    const appointmentData: any = {
      userId: user?._id || '',
      userName: formVal.name,
      serviceId: selectedSvc?._id || '',
      serviceName: selectedSvc?.name || formVal.service,
      date: formattedDate,
      time: formVal.time,
      notes: formVal.notes || ''
      // Note: status is set automatically by backend to 'pending'
    };

    // Only add staff fields if a stylist was selected
    if (selectedStaff) {
      appointmentData.staffId = selectedStaff._id;
      appointmentData.staffName = selectedStaff.name;
    }

    this.appointmentService.create(appointmentData).subscribe({
      next: () => {
        this.submitting = false;
        this.submitted = true;
        this.cdr.markForCheck();
        this.snackBar.open('🎉 Appointment booked successfully!', 'OK', { 
          duration: 6000,
          panelClass: ['success-snackbar'],
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      },
      error: (err) => {
        this.submitting = false;
        this.cdr.markForCheck();
        console.error('Booking error:', err);
        this.snackBar.open('Failed to book appointment. Please try again.', 'Retry', { 
          duration: 6000,
          panelClass: ['error-snackbar'],
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }

  bookAnother(): void {
    this.submitted = false;
    this.step = 1;
    this.bookingForm.reset();
    const user = this.authService.getCurrentUser();
    if (user) {
      this.bookingForm.patchValue({ name: user.name, phone: user.phone, email: user.email });
    }
    this.cdr.markForCheck();
  }
}
