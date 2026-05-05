/**
 * Frontend - Appointment Service Unit Tests
 * Comprehensive tests for Angular appointment service with HTTP mocking
 */

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AppointmentService } from './appointment.service';
import { environment } from '../../../environments/environment';

describe('AppointmentService', () => {
  let service: AppointmentService;
  let httpMock: HttpTestingController;

  const apiUrl = environment.apiUrl;

  // Mock appointment data
  const mockAppointment = {
    _id: '607f1f77bcf86cd799439020',
    userId: '507f1f77bcf86cd799439011',
    serviceId: '607f1f77bcf86cd799439030',
    date: '2024-05-15',
    time: '10:00 AM',
    status: 'pending',
    notes: '',
  };

  const mockAppointments = [
    mockAppointment,
    {
      ...mockAppointment,
      _id: '607f1f77bcf86cd799439021',
      status: 'confirmed',
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AppointmentService],
    });

    service = TestBed.inject(AppointmentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verify no outstanding HTTP requests
    httpMock.verify();
  });

  // ===== GET APPOINTMENTS =====
  describe('getAppointments', () => {
    it('should fetch all appointments', () => {
      service.getAppointments().subscribe((appointments) => {
        expect(appointments).toEqual(mockAppointments);
      });

      const req = httpMock.expectOne(`${apiUrl}/appointments`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAppointments);
    });

    it('should fetch appointments with filters', () => {
      const filters = { status: 'pending', date: '2024-05-15' };

      service.getAppointments(filters).subscribe((appointments) => {
        expect(appointments.length).toBeGreaterThan(0);
      });

      const req = httpMock.expectOne(
        (request) =>
          request.url === `${apiUrl}/appointments` &&
          request.params.get('status') === 'pending',
      );
      expect(req.request.method).toBe('GET');
      req.flush([mockAppointment]);
    });

    it('should handle error when fetching appointments', () => {
      service.getAppointments().subscribe(
        () => fail('should have failed'),
        (error) => {
          expect(error.status).toBe(500);
        },
      );

      const req = httpMock.expectOne(`${apiUrl}/appointments`);
      req.error(new ErrorEvent('Network error'), { status: 500 });
    });
  });

  // ===== GET APPOINTMENT BY ID =====
  describe('getAppointmentById', () => {
    it('should fetch appointment by ID', () => {
      const appointmentId = mockAppointment._id;

      service.getAppointmentById(appointmentId).subscribe((appointment) => {
        expect(appointment).toEqual(mockAppointment);
      });

      const req = httpMock.expectOne(
        `${apiUrl}/appointments/${appointmentId}`,
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockAppointment);
    });

    it('should handle 404 error for non-existent appointment', () => {
      service.getAppointmentById('nonexistent').subscribe(
        () => fail('should have failed'),
        (error) => {
          expect(error.status).toBe(404);
        },
      );

      const req = httpMock.expectOne(`${apiUrl}/appointments/nonexistent`);
      req.error(new ErrorEvent('Not found'), { status: 404 });
    });
  });

  // ===== CREATE APPOINTMENT =====
  describe('createAppointment', () => {
    it('should create a new appointment', () => {
      const createDto = {
        serviceId: '607f1f77bcf86cd799439030',
        date: '2024-05-15',
        time: '10:00 AM',
      };

      service.createAppointment(createDto).subscribe((appointment) => {
        expect(appointment).toEqual(mockAppointment);
      });

      const req = httpMock.expectOne(`${apiUrl}/appointments`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createDto);
      req.flush(mockAppointment);
    });

    it('should handle validation errors when creating appointment', () => {
      const invalidDto = {
        date: '2024-05-15',
        // missing serviceId
      };

      service.createAppointment(invalidDto).subscribe(
        () => fail('should have failed'),
        (error) => {
          expect(error.status).toBe(400);
        },
      );

      const req = httpMock.expectOne(`${apiUrl}/appointments`);
      req.error(new ErrorEvent('Validation error'), { status: 400 });
    });
  });

  // ===== UPDATE APPOINTMENT =====
  describe('updateAppointment', () => {
    it('should update appointment', () => {
      const appointmentId = mockAppointment._id;
      const updateDto = { notes: 'Updated notes' };
      const updatedAppointment = { ...mockAppointment, ...updateDto };

      service
        .updateAppointment(appointmentId, updateDto)
        .subscribe((appointment) => {
          expect(appointment).toEqual(updatedAppointment);
        });

      const req = httpMock.expectOne(
        `${apiUrl}/appointments/${appointmentId}`,
      );
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateDto);
      req.flush(updatedAppointment);
    });
  });

  // ===== UPDATE STATUS =====
  describe('updateAppointmentStatus', () => {
    it('should update appointment status', () => {
      const appointmentId = mockAppointment._id;
      const statusDto = { status: 'confirmed' };
      const updatedAppointment = { ...mockAppointment, status: 'confirmed' };

      service
        .updateAppointmentStatus(appointmentId, statusDto)
        .subscribe((appointment) => {
          expect(appointment.status).toBe('confirmed');
        });

      const req = httpMock.expectOne(
        `${apiUrl}/appointments/${appointmentId}/status`,
      );
      expect(req.request.method).toBe('PATCH');
      req.flush(updatedAppointment);
    });
  });

  // ===== GET USER APPOINTMENTS =====
  describe('getUserAppointments', () => {
    it('should fetch appointments for a specific user', () => {
      const userId = '507f1f77bcf86cd799439011';

      service.getUserAppointments(userId).subscribe((appointments) => {
        expect(appointments).toEqual(mockAppointments);
      });

      const req = httpMock.expectOne(`${apiUrl}/appointments/user/${userId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAppointments);
    });

    it('should return empty array if user has no appointments', () => {
      const userId = 'user-with-no-appointments';

      service.getUserAppointments(userId).subscribe((appointments) => {
        expect(appointments.length).toBe(0);
      });

      const req = httpMock.expectOne(`${apiUrl}/appointments/user/${userId}`);
      req.flush([]);
    });
  });

  // ===== DELETE APPOINTMENT =====
  describe('deleteAppointment', () => {
    it('should delete appointment', () => {
      const appointmentId = mockAppointment._id;

      service.deleteAppointment(appointmentId).subscribe((response) => {
        expect(response.message).toBe('Appointment deleted successfully');
      });

      const req = httpMock.expectOne(
        `${apiUrl}/appointments/${appointmentId}`,
      );
      expect(req.request.method).toBe('DELETE');
      req.flush({ message: 'Appointment deleted successfully' });
    });

    it('should handle error when deleting non-existent appointment', () => {
      service.deleteAppointment('nonexistent').subscribe(
        () => fail('should have failed'),
        (error) => {
          expect(error.status).toBe(404);
        },
      );

      const req = httpMock.expectOne(`${apiUrl}/appointments/nonexistent`);
      req.error(new ErrorEvent('Not found'), { status: 404 });
    });
  });

  // ===== OBSERVABLE BEHAVIOR =====
  describe('Observable Behavior', () => {
    it('should emit multiple appointment updates', (done) => {
      const appointmentUpdates = [
        { ...mockAppointment, status: 'pending' },
        { ...mockAppointment, status: 'confirmed' },
      ];

      let callCount = 0;

      service.getAppointments().subscribe((appointments) => {
        callCount++;
        if (callCount === 1) {
          expect(appointments[0].status).toBe('pending');
        } else if (callCount === 2) {
          expect(appointments[0].status).toBe('confirmed');
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/appointments`);
      req.flush(appointmentUpdates[0]);
    });

    it('should handle multiple concurrent requests', () => {
      const id1 = 'apt-1';
      const id2 = 'apt-2';

      service.getAppointmentById(id1).subscribe();
      service.getAppointmentById(id2).subscribe();

      const requests = httpMock.match((req) =>
        req.url.includes('/appointments/'),
      );

      expect(requests.length).toBe(2);
      requests[0].flush(mockAppointment);
      requests[1].flush(mockAppointment);
    });
  });
});
