/**
 * User Test Fixtures
 * Provides consistent user data for testing authentication, authorization, and user operations
 */

import { Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';

export class UserFixtures {
  // Standard test users
  static readonly CUSTOMER_USER = {
    _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '9876543210',
    password: 'hashedPassword123', // Pre-hashed
    role: 'customer',
    status: 'active',
    profileImage: 'https://example.com/image.jpg',
    address: '123 Main St, City',
    refreshToken: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  static readonly ADMIN_USER = {
    _id: new Types.ObjectId('507f1f77bcf86cd799439012'),
    name: 'Admin User',
    email: 'admin@example.com',
    phone: '9876543211',
    password: 'hashedAdminPassword123',
    role: 'admin',
    status: 'active',
    profileImage: null,
    address: null,
    refreshToken: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  static readonly STAFF_USER = {
    _id: new Types.ObjectId('507f1f77bcf86cd799439013'),
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '9876543212',
    password: 'hashedStaffPassword123',
    role: 'staff',
    status: 'active',
    profileImage: null,
    address: null,
    refreshToken: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  static readonly SUPERADMIN_USER = {
    _id: new Types.ObjectId('507f1f77bcf86cd799439014'),
    name: 'Super Admin',
    email: 'superadmin@example.com',
    phone: '9876543213',
    password: 'hashedSuperAdminPassword123',
    role: 'superadmin',
    status: 'active',
    profileImage: null,
    address: null,
    refreshToken: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  static readonly BLOCKED_USER = {
    _id: new Types.ObjectId('507f1f77bcf86cd799439015'),
    name: 'Blocked User',
    email: 'blocked@example.com',
    phone: '9876543214',
    password: 'hashedBlockedPassword123',
    role: 'customer',
    status: 'blocked',
    profileImage: null,
    address: null,
    refreshToken: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  // Registration DTO fixtures
  static readonly VALID_REGISTER_DTO = {
    name: 'New Customer',
    email: 'newcustomer@example.com',
    phone: '9999999999',
    password: 'SecurePassword123!',
  };

  static readonly INVALID_EMAIL_REGISTER_DTO = {
    name: 'Invalid Email User',
    email: 'invalidemail',
    phone: '9999999999',
    password: 'SecurePassword123!',
  };

  static readonly WEAK_PASSWORD_REGISTER_DTO = {
    name: 'Weak Password User',
    email: 'weak@example.com',
    phone: '9999999999',
    password: '123', // Too weak
  };

  static readonly MISSING_FIELD_REGISTER_DTO = {
    name: 'Missing Field User',
    // email is missing
    phone: '9999999999',
    password: 'SecurePassword123!',
  };

  // Login DTO fixtures
  static readonly VALID_LOGIN_DTO = {
    email: 'john.doe@example.com',
    password: 'password123',
  };

  static readonly INVALID_EMAIL_LOGIN_DTO = {
    email: 'nonexistent@example.com',
    password: 'password123',
  };

  static readonly INVALID_PASSWORD_LOGIN_DTO = {
    email: 'john.doe@example.com',
    password: 'wrongpassword',
  };

  // Password reset fixtures
  static readonly VALID_FORGOT_PASSWORD_DTO = {
    email: 'john.doe@example.com',
  };

  static readonly VALID_RESET_PASSWORD_DTO = {
    token: 'validResetToken123',
    newPassword: 'NewSecurePassword123!',
  };

  static readonly INVALID_RESET_PASSWORD_DTO = {
    token: 'invalidToken',
    newPassword: 'NewSecurePassword123!',
  };

  /**
   * Get a user by role
   */
  static getUserByRole(role: 'customer' | 'admin' | 'staff' | 'superadmin') {
    const users = {
      customer: this.CUSTOMER_USER,
      admin: this.ADMIN_USER,
      staff: this.STAFF_USER,
      superadmin: this.SUPERADMIN_USER,
    };
    return users[role];
  }

  /**
   * Get all test users
   */
  static getAllUsers() {
    return [
      this.CUSTOMER_USER,
      this.ADMIN_USER,
      this.STAFF_USER,
      this.SUPERADMIN_USER,
      this.BLOCKED_USER,
    ];
  }

  /**
   * Create a custom user object
   */
  static createCustomUser(overrides: Partial<typeof this.CUSTOMER_USER> = {}) {
    return {
      ...this.CUSTOMER_USER,
      _id: new Types.ObjectId(),
      ...overrides,
    };
  }

  /**
   * Hash a password for testing
   */
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }
}
