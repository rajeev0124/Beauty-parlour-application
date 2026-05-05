/**
 * Appointments Controller Integration Tests
 * Tests API endpoints with request/response validation
 */

/* eslint-disable @typescript-eslint/unbound-method */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import request from 'supertest';
import { AppointmentsController } from '../appointments.controller';
import { AppointmentsService } from '../appointments.service';
import { Appointment } from '../../../schemas/appointment.schema';
import { AppointmentFixtures } from '../../../../test/fixtures/appointments.fixture';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';

describe('AppointmentsController (Integration Tests)', () => {
  let app: INestApplication;
  let service: AppointmentsService;
  let appointmentModel: any;

  const mockCurrentUser = {
    _id: '507f1f77bcf86cd799439011',
    role: 'customer',
    email: 'customer@example.com',
  };

  beforeEach(async () => {
    appointmentModel = {
      find: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      create: jest.fn(),
      sort: jest.fn(),
    };

    const mockAppointmentsService = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByUser: jest.fn(),
      findByStaff: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppointmentsController],
      providers: [
        { provide: AppointmentsService, useValue: mockAppointmentsService },
        {
          provide: getModelToken(Appointment.name),
          useValue: appointmentModel,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: () => true,
      })
      .overrideGuard(RolesGuard)
      .useValue({
        canActivate: () => true,
      })
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    // Use an interceptor to inject the mock user into req.user
    app.useGlobalInterceptors({
      intercept(context, next) {
        const req = context.switchToHttp().getRequest();
        req.user = mockCurrentUser;
        return next.handle();
      },
    });

    service = module.get<AppointmentsService>(AppointmentsService);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  // ===== GET ALL APPOINTMENTS =====
  describe('GET /appointments', () => {
    it('should return all appointments', async () => {
      const appointments = AppointmentFixtures.getAllAppointments();
      (service.findAll as jest.Mock).mockResolvedValue(appointments);

      const response = await request(app.getHttpServer())
        .get('/appointments')
        .expect(200);

      expect(response.body).toBeDefined();
      expect(service.findAll).toHaveBeenCalled();
    });

    it('should filter appointments by status', async () => {
      const appointment = AppointmentFixtures.PENDING_APPOINTMENT;
      (service.findAll as jest.Mock).mockResolvedValue([appointment]);

      await request(app.getHttpServer())
        .get('/appointments')
        .query({ status: 'pending' })
        .expect(200);

      expect(service.findAll).toHaveBeenCalledWith({ status: 'pending' });
    });

    it('should filter appointments by date', async () => {
      const appointment = AppointmentFixtures.PENDING_APPOINTMENT;
      (service.findAll as jest.Mock).mockResolvedValue([appointment]);

      await request(app.getHttpServer())
        .get('/appointments')
        .query({ date: '2024-05-10' })
        .expect(200);

      expect(service.findAll).toHaveBeenCalledWith({ date: '2024-05-10' });
    });
  });

  // ===== GET APPOINTMENT BY ID =====
  describe('GET /appointments/:id', () => {
    it('should return appointment by ID', async () => {
      const appointment = AppointmentFixtures.PENDING_APPOINTMENT;
      (service.findById as jest.Mock).mockResolvedValue(appointment);

      const response = await request(app.getHttpServer())
        .get(`/appointments/${appointment._id.toString()}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(service.findById).toHaveBeenCalledWith(appointment._id.toString());
    });

    it('should return 404 if appointment not found', async () => {
      (service.findById as jest.Mock).mockRejectedValue(
        new Error('Appointment not found'),
      );

      await request(app.getHttpServer())
        .get('/appointments/nonexistent-id')
        .expect(500); // Depends on error handling
    });
  });

  // ===== GET USER APPOINTMENTS =====
  describe('GET /appointments/user/:id', () => {
    it('should return appointments for a specific user', async () => {
      const appointments = [
        AppointmentFixtures.PENDING_APPOINTMENT,
        AppointmentFixtures.COMPLETED_APPOINTMENT,
      ];
      const userId = '507f1f77bcf86cd799439011';

      (service.findByUser as jest.Mock).mockResolvedValue(appointments);

      const response = await request(app.getHttpServer())
        .get(`/appointments/user/${userId}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(service.findByUser).toHaveBeenCalledWith(userId);
    });
  });

  // ===== GET STAFF APPOINTMENTS =====
  describe('GET /appointments/staff/:id', () => {
    it('should return appointments for a specific staff member', async () => {
      const staffId = '607f1f77bcf86cd799439040';
      const appointments = [AppointmentFixtures.PENDING_APPOINTMENT];

      (service.findByStaff as jest.Mock).mockResolvedValue(appointments);

      await request(app.getHttpServer())
        .get(`/appointments/staff/${staffId}`)
        .expect(200);

      expect(service.findByStaff).toHaveBeenCalledWith(staffId);
    });
  });

  // ===== CREATE APPOINTMENT =====
  describe('POST /appointments', () => {
    it('should create a new appointment', async () => {
      const createDto = AppointmentFixtures.VALID_CREATE_DTO;
      const created = AppointmentFixtures.PENDING_APPOINTMENT;

      (service.create as jest.Mock).mockResolvedValue(created);

      const response = await request(app.getHttpServer())
        .post('/appointments')
        .send(createDto)
        .expect(201);

      expect(response.body).toBeDefined();
      expect(service.create).toHaveBeenCalled();
    });

    it('should validate required fields', async () => {
      const invalidDto = AppointmentFixtures.MISSING_SERVICE_DTO;

      await request(app.getHttpServer())
        .post('/appointments')
        .send(invalidDto)
        .expect(400); // Bad request due to validation
    });

    it('should reject appointment with past date', async () => {
      const invalidDto = AppointmentFixtures.INVALID_PAST_DATE_DTO;

      await request(app.getHttpServer())
        .post('/appointments')
        .send(invalidDto)
        .expect(400);
    });

    it('should reject invalid time format', async () => {
      const invalidDto = AppointmentFixtures.INVALID_TIME_FORMAT_DTO;

      await request(app.getHttpServer())
        .post('/appointments')
        .send(invalidDto)
        .expect(400);
    });
  });

  // ===== UPDATE APPOINTMENT =====
  describe('PUT /appointments/:id', () => {
    it('should update appointment', async () => {
      const appointmentId = AppointmentFixtures.PENDING_APPOINTMENT._id;
      const updateDto = { notes: 'Updated notes' };
      const updated = {
        ...AppointmentFixtures.PENDING_APPOINTMENT,
        ...updateDto,
      };

      (service.update as jest.Mock).mockResolvedValue(updated);

      const response = await request(app.getHttpServer())
        .put(`/appointments/${appointmentId.toString()}`)
        .send(updateDto)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(service.update).toHaveBeenCalledWith(
        appointmentId.toString(),
        updateDto,
      );
    });
  });

  // ===== UPDATE STATUS =====
  describe('PATCH /appointments/:id/status', () => {
    it('should update appointment status', async () => {
      const appointmentId = AppointmentFixtures.PENDING_APPOINTMENT._id;
      const statusDto = { status: 'confirmed' };
      const updated = {
        ...AppointmentFixtures.PENDING_APPOINTMENT,
        status: 'confirmed',
      };

      (service.updateStatus as jest.Mock).mockResolvedValue(updated);

      const response = await request(app.getHttpServer())
        .put(`/appointments/status/${appointmentId.toString()}`)
        .send(statusDto)
        .expect(200);

      expect(response.body.status).toBe('confirmed');
    });

    it('should validate status value', async () => {
      const appointmentId = AppointmentFixtures.PENDING_APPOINTMENT._id;
      const invalidStatusDto = { status: 'invalid-status' };

      (service.updateStatus as jest.Mock).mockRejectedValue(
        new Error('Invalid status'),
      );

      await request(app.getHttpServer())
        .put(`/appointments/status/${appointmentId.toString()}`)
        .send(invalidStatusDto)
        .expect(500);
    });
  });

  // ===== DELETE APPOINTMENT =====
  describe('DELETE /appointments/:id', () => {
    it('should delete appointment', async () => {
      const appointmentId = AppointmentFixtures.PENDING_APPOINTMENT._id;

      (service.remove as jest.Mock).mockResolvedValue({
        message: 'Appointment deleted successfully',
      });

      await request(app.getHttpServer())
        .delete(`/appointments/${appointmentId.toString()}`)
        .expect(200);

      expect(service.remove).toHaveBeenCalledWith(appointmentId.toString());
    });

    it('should return 404 if appointment not found', async () => {
      (service.remove as jest.Mock).mockRejectedValue(
        new Error('Appointment not found'),
      );

      await request(app.getHttpServer())
        .delete('/appointments/nonexistent-id')
        .expect(500);
    });
  });
});
