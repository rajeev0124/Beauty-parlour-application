import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppointmentsComponent } from './appointments.component';
import { AppointmentService } from '../../core/services/appointment.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('AppointmentsComponent', () => {
  let component: AppointmentsComponent;
  let fixture: ComponentFixture<AppointmentsComponent>;
  let appointmentServiceSpy: jasmine.SpyObj<AppointmentService>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  const mockAppointments = [
    { _id: '1', userName: 'John Doe', status: 'pending', date: new Date().toISOString() },
    { _id: '2', userName: 'Jane Smith', status: 'confirmed', date: new Date().toISOString() }
  ];

  beforeEach(async () => {
    appointmentServiceSpy = jasmine.createSpyObj('AppointmentService', ['getAll', 'updateStatus']);
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [AppointmentsComponent, NoopAnimationsModule],
      providers: [
        { provide: AppointmentService, useValue: appointmentServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    appointmentServiceSpy.getAll.and.returnValue(of([]));
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load appointments on init', () => {
    appointmentServiceSpy.getAll.and.returnValue(of(mockAppointments as any));
    fixture.detectChanges();

    expect(appointmentServiceSpy.getAll).toHaveBeenCalled();
    expect(component.dataSource.data).toEqual(mockAppointments as any);
    expect(component.loading).toBeFalse();
  });

  it('should show snackbar on load error', () => {
    appointmentServiceSpy.getAll.and.returnValue(throwError(() => new Error('Error')));
    fixture.detectChanges();

    expect(snackBarSpy.open).toHaveBeenCalledWith('Failed to load appointments', 'Close', { duration: 3000 });
    expect(component.loading).toBeFalse();
  });

  it('should update status and reload appointments', () => {
    appointmentServiceSpy.updateStatus.and.returnValue(of({} as any));
    appointmentServiceSpy.getAll.and.returnValue(of(mockAppointments as any));
    
    component.updateStatus('1', 'confirmed');
    
    expect(appointmentServiceSpy.updateStatus).toHaveBeenCalledWith('1', 'confirmed');
    expect(snackBarSpy.open).toHaveBeenCalledWith('Status updated', 'Close', { duration: 3000 });
    expect(appointmentServiceSpy.getAll).toHaveBeenCalledTimes(2); // One on init (if called) and one after update
  });

  it('should filter appointments by status', () => {
    appointmentServiceSpy.getAll.and.returnValue(of(mockAppointments as any));
    fixture.detectChanges();

    component.filterByStatus('pending');
    expect(component.statusFilter).toBe('pending');
    expect(component.dataSource.filter).toBe('pending');
  });
});
