import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog.component';
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

@Component({
  selector: 'app-my-appointments',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, DecimalPipe, MatIconModule, MatButtonModule, MatSnackBarModule, MatDialogModule],
  templateUrl: './my-appointments.component.html',
  styleUrl: './my-appointments.component.scss'
})
export class MyAppointmentsComponent implements OnInit {
  activeTab: 'upcoming' | 'completed' | 'cancelled' = 'upcoming';
  loading = true;
  errorMessage = '';
  appointments: DisplayAppointment[] = [];
  isLoggedIn = false;

  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (!this.isLoggedIn) {
      this.loading = false;
      this.errorMessage = 'Please sign in to view your appointments.';
      this.cdr.detectChanges();
      return;
    }
    this.loadAppointments();
  }

  goToSignIn(): void {
    this.router.navigate(['/sign-in']);
  }

  loadAppointments(): void {
    this.loading = true;
    this.errorMessage = '';

    this.http.get<any[]>(`${environment.apiUrl}/customer/appointments`).subscribe({
      next: (appointments) => {
        console.log('Loaded appointments:', appointments);
        
        if (!appointments || appointments.length === 0) {
          this.appointments = [];
          this.loading = false;
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
        
        // Smart Tab Selection: If no upcoming, but has completed, switch tab
        const hasUpcoming = this.appointments.some(a => a.status === 'upcoming');
        const hasCompleted = this.appointments.some(a => a.status === 'completed');
        
        if (!hasUpcoming && hasCompleted && this.activeTab === 'upcoming') {
          this.activeTab = 'completed';
        }

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load appointments:', err);
        if (err.status === 401) {
          this.errorMessage = 'Your session has expired. Please sign in again.';
        } else {
          this.errorMessage = 'Failed to load appointments. Please try again later.';
        }
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get filteredAppointments(): DisplayAppointment[] {
    return this.appointments.filter(a => a.status === this.activeTab);
  }

  setTab(tab: 'upcoming' | 'completed' | 'cancelled'): void {
    this.activeTab = tab;
  }

  cancelAppointment(appt: DisplayAppointment): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Cancel Appointment',
        message: `Are you sure you want to cancel your ${appt.service} appointment?`,
        confirmText: 'Yes, Cancel',
        cancelText: 'Keep it'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.http.put(`${environment.apiUrl}/customer/appointments/${appt._id}/cancel`, {}).subscribe({
          next: () => {
            appt.status = 'cancelled';
            this.snackBar.open('✓ Appointment cancelled successfully', 'OK', { 
              duration: 5000,
              panelClass: ['warning-snackbar'],
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
          },
          error: () => {
            this.snackBar.open('Failed to cancel appointment. Please try again.', 'Retry', { 
              duration: 5000,
              panelClass: ['error-snackbar'],
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
          }
        });
      }
    });
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'upcoming': return 'event';
      case 'completed': return 'check_circle';
      case 'cancelled': return 'cancel';
      default: return 'event';
    }
  }

  getCount(tab: 'upcoming' | 'completed' | 'cancelled'): number {
    return this.appointments.filter(a => a.status === tab).length;
  }

  getEmptyIcon(): string {
    switch (this.activeTab) {
      case 'upcoming': return 'event_busy';
      case 'completed': return 'task_alt';
      case 'cancelled': return 'event_note';
      default: return 'event_busy';
    }
  }
}
