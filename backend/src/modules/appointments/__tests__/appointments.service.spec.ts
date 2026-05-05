/**
 * Appointments Service Unit Tests
 * Comprehensive tests for appointment management service
 */

import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { AppointmentsService } from '../appointments.service';
import { Appointment } from '../../../schemas/appointment.schema';
import { AppointmentFixtures } from '../../../../test/fixtures/appointments.fixture';
import { Types } from 'mongoose';

describe('AppointmentsService (Unit Tests)', () => {
  let service: AppointmentsService;
  let appointmentModel: any;

  beforeEach(async () => {
    // Create mock appointment model
    appointmentModel = {
      find: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
      create: jest.fn(),
      countDocuments: jest.fn(),
      sort: jest.fn(),
      exec: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        {
          provide: getModelToken(Appointment.name),
          useValue: appointmentModel,
        },
      ],
    }).compile();

    service = module.get<AppointmentsService>(AppointmentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ===== FIND ALL APPOINTMENTS =====
  describe('findAll', () => {
    it('should return all appointments', async () => {
      const appointments = AppointmentFixtures.getAllAppointments();

      appointmentModel.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(appointments),
      });

      // Execute
      const result = await service.findAll({});

      // Assert
      expect(result).toEqual(appointments);
      expect(appointmentModel.find).toHaveBeenCalledWith({});
    });

    it('should filter appointments by status', async () => {
      const pending = AppointmentFixtures.PENDING_APPOINTMENT;

      appointmentModel.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([pending]),
      });

      // Execute
      await service.findAll({ status: 'pending' });

      // Assert
      expect(appointmentModel.find).toHaveBeenCalledWith({ status: 'pending' });
    });

    it('should filter appointments by date', async () => {
      const date = '2024-05-10';
      const appointments = [AppointmentFixtures.PENDING_APPOINTMENT];

      appointmentModel.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(appointments),
      });

      // Execute
      await service.findAll({ date });

      // Assert
      expect(appointmentModel.find).toHaveBeenCalledWith({ date });
    });

    it('should filter by both status and date', async () => {
      const status = 'confirmed';
      const date = '2024-05-11';
      const appointments = [AppointmentFixtures.CONFIRMED_APPOINTMENT];

      appointmentModel.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(appointments),
      });

      // Execute
      await service.findAll({ status, date });

      // Assert
      expect(appointmentModel.find).toHaveBeenCalledWith({ status, date });
    });
  });

  // ===== FIND BY ID =====
  describe('findById', () => {
    it('should return appointment by ID', async () => {
      const appointment = AppointmentFixtures.PENDING_APPOINTMENT;

      appointmentModel.findById.mockResolvedValue(appointment);

      // Execute
      const result = await service.findById(appointment._id.toString());

      // Assert
      expect(result).toEqual(appointment);
      expect(appointmentModel.findById).toHaveBeenCalledWith(
        appointment._id.toString(),
      );
    });

    it('should throw NotFoundException if appointment not found', async () => {
      appointmentModel.findById.mockResolvedValue(null);

      // Execute & Assert
      await expect(service.findById('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ===== FIND BY USER =====
  describe('findByUser', () => {
    it('should return appointments for a specific user', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const appointments = [
        AppointmentFixtures.PENDING_APPOINTMENT,
        AppointmentFixtures.COMPLETED_APPOINTMENT,
      ];

      appointmentModel.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(appointments),
      });

      // Execute
      const result = await service.findByUser(userId);

      // Assert
      expect(result).toEqual(appointments);
      expect(appointmentModel.find).toHaveBeenCalled();
    });

    it('should return empty array if user has no appointments', async () => {
      const userId = '507f1f77bcf86cd799439099';

      appointmentModel.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([]),
      });

      // Execute
      const result = await service.findByUser(userId);

      // Assert
      expect(result).toEqual([]);
    });
  });

  // ===== FIND BY STAFF =====
  describe('findByStaff', () => {
    it('should return appointments for a specific staff member', async () => {
      const staffId = '607f1f77bcf86cd799439040';
      const appointments = [
        AppointmentFixtures.PENDING_APPOINTMENT,
        AppointmentFixtures.CONFIRMED_APPOINTMENT,
      ];

      appointmentModel.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(appointments),
      });

      // Execute
      const result = await service.findByStaff(staffId);

      // Assert
      expect(result).toEqual(appointments);
      expect(appointmentModel.find).toHaveBeenCalledWith({ staffId });
    });
  });

  // ===== CREATE APPOINTMENT =====
  describe('create', () => {
    it('should create a new appointment with pending status', async () => {
      const createDto = AppointmentFixtures.VALID_CREATE_DTO;

      const createdAppointment = {
        ...createDto,
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId('507f1f77bcf86cd799439011'),
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      appointmentModel.create.mockResolvedValue(createdAppointment);

      // Execute
      const result = await service.create({
        ...createDto,
        userId: '507f1f77bcf86cd799439011',
      });

      // Assert
      expect(result).toEqual(createdAppointment);
      expect(result.status).toBe('pending');
      expect(appointmentModel.create).toHaveBeenCalled();
    });

    it('should throw error if userId is missing', async () => {
      const createDto = AppointmentFixtures.VALID_CREATE_DTO;

      // Execute & Assert
      await expect(service.create(createDto)).rejects.toThrow(
        'userId is required',
      );
    });

    it('should convert string IDs to ObjectIds', async () => {
      const createDto = AppointmentFixtures.VALID_CREATE_DTO;

      appointmentModel.create.mockResolvedValue({
        ...createDto,
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId('507f1f77bcf86cd799439011'),
        status: 'pending',
      });

      // Execute
      await service.create({
        ...createDto,
        userId: '507f1f77bcf86cd799439011',
      });

      // Assert - verify ObjectIds were created
      const createCall = appointmentModel.create.mock.calls[0][0];
      expect(createCall.userId).toBeInstanceOf(Types.ObjectId);
    });

    it('should create appointment with default pending status', async () => {
      const createDto = AppointmentFixtures.VALID_CREATE_DTO;

      const createdAppointment = {
        ...createDto,
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId('507f1f77bcf86cd799439011'),
        status: 'pending',
      };

      appointmentModel.create.mockResolvedValue(createdAppointment);

      // Execute
      const result = await service.create({
        ...createDto,
        userId: '507f1f77bcf86cd799439011',
      });

      // Assert
      expect(result.status).toBe('pending');
    });
  });

  // ===== UPDATE APPOINTMENT =====
  describe('update', () => {
    it('should update appointment', async () => {
      const appointmentId =
        AppointmentFixtures.PENDING_APPOINTMENT._id.toString();
      const updateDto = { notes: 'Updated notes' };

      const updatedAppointment = {
        ...AppointmentFixtures.PENDING_APPOINTMENT,
        ...updateDto,
      };

      appointmentModel.findByIdAndUpdate.mockResolvedValue(updatedAppointment);

      // Execute
      const result = await service.update(appointmentId, updateDto);

      // Assert
      expect(result).toEqual(updatedAppointment);
      expect(appointmentModel.findByIdAndUpdate).toHaveBeenCalledWith(
        appointmentId,
        updateDto,
        { returnDocument: 'after', runValidators: true },
      );
    });

    it('should throw NotFoundException if appointment not found', async () => {
      appointmentModel.findByIdAndUpdate.mockResolvedValue(null);

      // Execute & Assert
      await expect(
        service.update('nonexistent-id', { notes: 'new notes' }),
      ).rejects.toThrow();
    });
  });

  // ===== UPDATE STATUS =====
  describe('updateStatus', () => {
    it('should update appointment status', async () => {
      const appointmentId =
        AppointmentFixtures.PENDING_APPOINTMENT._id.toString();
      const updateDto = { status: 'confirmed' };

      const updatedAppointment = {
        ...AppointmentFixtures.PENDING_APPOINTMENT,
        status: 'confirmed',
      };

      appointmentModel.findByIdAndUpdate.mockResolvedValue(updatedAppointment);

      // Execute
      const result = await service.updateStatus(appointmentId, updateDto);

      // Assert
      expect(result.status).toBe('confirmed');
      expect(appointmentModel.findByIdAndUpdate).toHaveBeenCalledWith(
        appointmentId,
        { status: 'confirmed' },
        { returnDocument: 'after', runValidators: true },
      );
    });

    it('should allow status transitions: pending -> confirmed', async () => {
      const appointmentId =
        AppointmentFixtures.PENDING_APPOINTMENT._id.toString();

      appointmentModel.findById.mockResolvedValue(
        AppointmentFixtures.PENDING_APPOINTMENT,
      );
      appointmentModel.findByIdAndUpdate.mockResolvedValue({
        ...AppointmentFixtures.PENDING_APPOINTMENT,
        status: 'confirmed',
      });

      // Execute
      const result = await service.updateStatus(appointmentId, {
        status: 'confirmed',
      });

      // Assert
      expect(result.status).toBe('confirmed');
    });

    it('should allow status transitions: confirmed -> completed', async () => {
      const appointmentId =
        AppointmentFixtures.CONFIRMED_APPOINTMENT._id.toString();

      appointmentModel.findById.mockResolvedValue(
        AppointmentFixtures.CONFIRMED_APPOINTMENT,
      );
      appointmentModel.findByIdAndUpdate.mockResolvedValue({
        ...AppointmentFixtures.CONFIRMED_APPOINTMENT,
        status: 'completed',
      });

      // Execute
      const result = await service.updateStatus(appointmentId, {
        status: 'completed',
      });

      // Assert
      expect(result.status).toBe('completed');
    });

    it('should allow cancellation from any status', async () => {
      const appointmentId =
        AppointmentFixtures.CONFIRMED_APPOINTMENT._id.toString();

      appointmentModel.findById.mockResolvedValue(
        AppointmentFixtures.CONFIRMED_APPOINTMENT,
      );
      appointmentModel.findByIdAndUpdate.mockResolvedValue({
        ...AppointmentFixtures.CONFIRMED_APPOINTMENT,
        status: 'cancelled',
      });

      // Execute
      const result = await service.updateStatus(appointmentId, {
        status: 'cancelled',
      });

      // Assert
      expect(result.status).toBe('cancelled');
    });
  });

  // ===== DELETE APPOINTMENT =====
  describe('delete', () => {
    it('should delete appointment', async () => {
      const appointmentId =
        AppointmentFixtures.PENDING_APPOINTMENT._id.toString();

      appointmentModel.findByIdAndDelete.mockResolvedValue(
        AppointmentFixtures.PENDING_APPOINTMENT,
      );

      // Execute
      const result = await service.remove(appointmentId);

      // Assert
      expect(result).toEqual({ message: 'Appointment deleted successfully' });
      expect(appointmentModel.findByIdAndDelete).toHaveBeenCalledWith(
        appointmentId,
      );
    });

    it('should throw NotFoundException if appointment not found', async () => {
      appointmentModel.findByIdAndDelete.mockResolvedValue(null);

      // Execute & Assert
      await expect(service.remove('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
