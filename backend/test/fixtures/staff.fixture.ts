/**
 * Staff Test Fixtures
 * Provides consistent staff data for testing staff management
 */

import { Types } from 'mongoose';

export class StaffFixtures {
  static readonly STAFF_MEMBER_1 = {
    _id: new Types.ObjectId('607f1f77bcf86cd799439040'),
    userId: new Types.ObjectId('507f1f77bcf86cd799439013'),
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '9876543212',
    specialization: ['Hair', 'Skin Care'],
    availability: {
      monday: { start: '09:00 AM', end: '06:00 PM', isAvailable: true },
      tuesday: { start: '09:00 AM', end: '06:00 PM', isAvailable: true },
      wednesday: { start: '09:00 AM', end: '06:00 PM', isAvailable: true },
      thursday: { start: '09:00 AM', end: '06:00 PM', isAvailable: true },
      friday: { start: '09:00 AM', end: '06:00 PM', isAvailable: true },
      saturday: { start: '10:00 AM', end: '05:00 PM', isAvailable: true },
      sunday: { start: '10:00 AM', end: '04:00 PM', isAvailable: false },
    },
    bio: 'Experienced beautician with 5 years of expertise',
    profileImage: 'https://example.com/staff/jane.jpg',
    isActive: true,
    rating: 4.8,
    totalAppointments: 150,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  static readonly STAFF_MEMBER_2 = {
    _id: new Types.ObjectId('607f1f77bcf86cd799439041'),
    userId: new Types.ObjectId('507f1f77bcf86cd799439014'),
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    phone: '9876543213',
    specialization: ['Nails', 'Spa'],
    availability: {
      monday: { start: '10:00 AM', end: '07:00 PM', isAvailable: true },
      tuesday: { start: '10:00 AM', end: '07:00 PM', isAvailable: true },
      wednesday: { start: '10:00 AM', end: '07:00 PM', isAvailable: true },
      thursday: { start: '10:00 AM', end: '07:00 PM', isAvailable: true },
      friday: { start: '10:00 AM', end: '07:00 PM', isAvailable: true },
      saturday: { start: '11:00 AM', end: '06:00 PM', isAvailable: true },
      sunday: { start: '', end: '', isAvailable: false },
    },
    bio: 'Specialist in nail art and spa treatments',
    profileImage: 'https://example.com/staff/sarah.jpg',
    isActive: true,
    rating: 4.9,
    totalAppointments: 200,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  static readonly INACTIVE_STAFF = {
    _id: new Types.ObjectId('607f1f77bcf86cd799439042'),
    userId: new Types.ObjectId('507f1f77bcf86cd799439015'),
    name: 'Inactive Staff',
    email: 'inactive@example.com',
    phone: '9876543214',
    specialization: ['Hair'],
    availability: {},
    bio: 'Currently unavailable',
    profileImage: null,
    isActive: false,
    rating: 4.5,
    totalAppointments: 50,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  // Create Staff DTO fixtures
  static readonly VALID_CREATE_DTO = {
    userId: '507f1f77bcf86cd799439016',
    name: 'New Staff',
    email: 'newstaff@example.com',
    phone: '9999999999',
    specialization: ['Hair', 'Nails'],
    bio: 'New team member',
  };

  static readonly MISSING_SPECIALIZATION_DTO = {
    userId: '507f1f77bcf86cd799439016',
    name: 'Staff Without Specialization',
    email: 'nospecial@example.com',
    phone: '9999999999',
    specialization: [], // Empty specialization
    bio: 'New team member',
  };

  /**
   * Get all test staff members
   */
  static getAllStaff() {
    return [this.STAFF_MEMBER_1, this.STAFF_MEMBER_2, this.INACTIVE_STAFF];
  }

  /**
   * Get only active staff
   */
  static getActiveStaff() {
    return [this.STAFF_MEMBER_1, this.STAFF_MEMBER_2];
  }

  /**
   * Create a custom staff member
   */
  static createCustomStaff(
    overrides: Partial<typeof this.STAFF_MEMBER_1> = {},
  ) {
    return {
      ...this.STAFF_MEMBER_1,
      _id: new Types.ObjectId(),
      userId: new Types.ObjectId(),
      ...overrides,
    };
  }

  /**
   * Get staff by specialization
   */
  static getStaffBySpecialization(specialization: string) {
    return this.getAllStaff().filter((staff) =>
      staff.specialization.includes(specialization),
    );
  }
}
