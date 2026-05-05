/**
 * Appointment Test Fixtures
 * Provides consistent appointment data for testing appointment management flows
 */

import { Types } from 'mongoose';

export class AppointmentFixtures {
  static readonly PENDING_APPOINTMENT = {
    _id: new Types.ObjectId('607f1f77bcf86cd799439020'),
    userId: new Types.ObjectId('507f1f77bcf86cd799439011'),
    userName: 'John Doe',
    serviceId: new Types.ObjectId('607f1f77bcf86cd799439030'),
    serviceName: 'Hair Cut',
    staffId: new Types.ObjectId('607f1f77bcf86cd799439040'),
    staffName: 'Jane Smith',
    date: '2024-05-10',
    time: '10:00 AM',
    status: 'pending',
    notes: 'Regular haircut',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  static readonly CONFIRMED_APPOINTMENT = {
    _id: new Types.ObjectId('607f1f77bcf86cd799439021'),
    userId: new Types.ObjectId('507f1f77bcf86cd799439011'),
    userName: 'John Doe',
    serviceId: new Types.ObjectId('607f1f77bcf86cd799439031'),
    serviceName: 'Facial',
    staffId: new Types.ObjectId('607f1f77bcf86cd799439040'),
    staffName: 'Jane Smith',
    date: '2024-05-11',
    time: '02:00 PM',
    status: 'confirmed',
    notes: 'Hydrating facial',
    createdAt: new Date('2024-05-01'),
    updatedAt: new Date('2024-05-02'),
  };

  static readonly COMPLETED_APPOINTMENT = {
    _id: new Types.ObjectId('607f1f77bcf86cd799439022'),
    userId: new Types.ObjectId('507f1f77bcf86cd799439011'),
    userName: 'John Doe',
    serviceId: new Types.ObjectId('607f1f77bcf86cd799439032'),
    serviceName: 'Manicure',
    staffId: new Types.ObjectId('607f1f77bcf86cd799439040'),
    staffName: 'Jane Smith',
    date: '2024-04-10',
    time: '11:00 AM',
    status: 'completed',
    notes: 'Gel manicure with design',
    createdAt: new Date('2024-04-05'),
    updatedAt: new Date('2024-04-10'),
  };

  static readonly CANCELLED_APPOINTMENT = {
    _id: new Types.ObjectId('607f1f77bcf86cd799439023'),
    userId: new Types.ObjectId('507f1f77bcf86cd799439012'),
    userName: 'Another Customer',
    serviceId: new Types.ObjectId('607f1f77bcf86cd799439033'),
    serviceName: 'Pedicure',
    staffId: new Types.ObjectId('607f1f77bcf86cd799439040'),
    staffName: 'Jane Smith',
    date: '2024-05-12',
    time: '03:00 PM',
    status: 'cancelled',
    notes: 'Customer requested cancellation',
    createdAt: new Date('2024-05-01'),
    updatedAt: new Date('2024-05-03'),
  };

  // Create Appointment DTO fixtures
  static readonly VALID_CREATE_DTO = {
    serviceId: '607f1f77bcf86cd799439030',
    serviceName: 'Hair Cut',
    staffId: '607f1f77bcf86cd799439040',
    staffName: 'Jane Smith',
    date: '2027-05-15',
    time: '10:00 AM',
    notes: 'Please arrive 5 minutes early',
  };

  static readonly INVALID_PAST_DATE_DTO = {
    serviceId: '607f1f77bcf86cd799439030',
    serviceName: 'Hair Cut',
    staffId: '607f1f77bcf86cd799439040',
    staffName: 'Jane Smith',
    date: '2020-01-01', // Past date
    time: '10:00 AM',
    notes: '',
  };

  static readonly INVALID_TIME_FORMAT_DTO = {
    serviceId: '607f1f77bcf86cd799439030',
    serviceName: 'Hair Cut',
    staffId: '607f1f77bcf86cd799439040',
    staffName: 'Jane Smith',
    date: '2024-05-15',
    time: 'invalid-time',
    notes: '',
  };

  static readonly MISSING_SERVICE_DTO = {
    // serviceId is missing
    serviceName: 'Hair Cut',
    staffId: '607f1f77bcf86cd799439040',
    staffName: 'Jane Smith',
    date: '2024-05-15',
    time: '10:00 AM',
    notes: '',
  };

  // Update Appointment DTO fixtures
  static readonly VALID_UPDATE_STATUS_DTO = {
    status: 'confirmed',
  };

  static readonly INVALID_STATUS_DTO = {
    status: 'invalid-status',
  };

  static readonly CANCEL_APPOINTMENT_DTO = {
    status: 'cancelled',
  };

  /**
   * Get appointment by status
   */
  static getAppointmentByStatus(
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show',
  ) {
    const appointments = {
      pending: this.PENDING_APPOINTMENT,
      confirmed: this.CONFIRMED_APPOINTMENT,
      completed: this.COMPLETED_APPOINTMENT,
      cancelled: this.CANCELLED_APPOINTMENT,
      'no-show': this.COMPLETED_APPOINTMENT, // Use completed as base for no-show
    };
    return appointments[status];
  }

  /**
   * Get all test appointments
   */
  static getAllAppointments() {
    return [
      this.PENDING_APPOINTMENT,
      this.CONFIRMED_APPOINTMENT,
      this.COMPLETED_APPOINTMENT,
      this.CANCELLED_APPOINTMENT,
    ];
  }

  /**
   * Create a custom appointment
   */
  static createCustomAppointment(
    overrides: Partial<typeof this.PENDING_APPOINTMENT> = {},
  ) {
    return {
      ...this.PENDING_APPOINTMENT,
      _id: new Types.ObjectId(),
      userId: new Types.ObjectId(),
      ...overrides,
    };
  }

  /**
   * Create appointment for future date
   */
  static createFutureAppointment(daysFromNow: number = 7) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysFromNow);
    const dateString = futureDate.toISOString().split('T')[0];

    return this.createCustomAppointment({
      date: dateString,
      status: 'pending',
    });
  }

  /**
   * Create appointment for past date
   */
  static createPastAppointment(daysAgo: number = 7) {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - daysAgo);
    const dateString = pastDate.toISOString().split('T')[0];

    return this.createCustomAppointment({
      date: dateString,
      status: 'completed',
    });
  }
}
