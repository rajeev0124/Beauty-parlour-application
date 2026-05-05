import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AppointmentService } from './appointment.service';
import { environment } from '../../../environments/environment';
import { Appointment } from '../models/appointment.model';

describe('AppointmentService', () => {
  let service: AppointmentService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/appointments`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AppointmentService]
    });
    service = TestBed.inject(AppointmentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('should return an Observable of appointments', () => {
      const mockAppointments: Appointment[] = [
        { _id: '1', userId: 'u1', serviceId: 's1', date: '2024-01-01', time: '10:00', status: 'pending' } as any
      ];

      service.getAll().subscribe(appointments => {
        expect(appointments.length).toBe(1);
        expect(appointments).toEqual(mockAppointments);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockAppointments);
    });
  });

  describe('create', () => {
    it('should post the new appointment', () => {
      const newAppt = { userId: 'u1', serviceId: 's1' };
      const mockResponse = { ...newAppt, _id: '123' } as any;

      service.create(newAppt).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newAppt);
      req.flush(mockResponse);
    });
  });

  describe('updateStatus', () => {
    it('should put the new status', () => {
      const id = '123';
      const status = 'confirmed';
      const mockResponse = { _id: id, status } as any;

      service.updateStatus(id, status).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/status/${id}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ status });
      req.flush(mockResponse);
    });
  });
});
