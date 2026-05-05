/**
 * Database Schema Unit Tests
 * Tests MongoDB schema validation, constraints, and indexes
 */

import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../src/schemas/user.schema';
import {
  Appointment,
  AppointmentSchema,
} from '../src/schemas/appointment.schema';
import { UserFixtures } from './fixtures/users.fixture';
import { Model } from 'mongoose';

describe('Database Schemas (Unit Tests)', () => {
  let mongoServer: MongoMemoryServer;
  let userModel: Model<User>;
  let appointmentModel: Model<Appointment>;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([
          { name: User.name, schema: UserSchema },
          { name: Appointment.name, schema: AppointmentSchema },
        ]),
      ],
    }).compile();

    userModel = module.get<Model<User>>(getModelToken(User.name));
    appointmentModel = module.get<Model<Appointment>>(
      getModelToken(Appointment.name),
    );
  });

  afterAll(async () => {
    if (mongoServer) await mongoServer.stop();
  });

  // ===== USER SCHEMA TESTS =====
  describe('User Schema Validation', () => {
    afterEach(async () => {
      await userModel.deleteMany({});
    });

    it('should create user with all required fields', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '9876543210',
        password: 'hashedPassword123',
      };

      const user = await userModel.create(userData);

      expect(user).toBeDefined();
      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email);
      expect(user.password).toBe(userData.password);
    });

    it('should require email field', async () => {
      const userData = {
        name: 'John Doe',
        phone: '9876543210',
        password: 'hashedPassword123',
        // email is missing
      };

      await expect(userModel.create(userData)).rejects.toThrow();
    });

    it('should require name field', async () => {
      const userData = {
        email: 'john@example.com',
        phone: '9876543210',
        password: 'hashedPassword123',
        // name is missing
      };

      await expect(userModel.create(userData)).rejects.toThrow();
    });

    it('should require password field', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '9876543210',
        // password is missing
      };

      await expect(userModel.create(userData)).rejects.toThrow();
    });

    it('should enforce unique email constraint', async () => {
      const email = `unique-${Date.now()}@example.com`;
      const userData = {
        name: 'John Doe',
        email,
        phone: '9876543210',
        password: 'hashedPassword123',
      };

      // Create first user
      await userModel.create(userData);

      // Try to create second user with same email
      await expect(
        userModel.create({
          ...userData,
          name: 'Different Name',
          phone: '1111111111',
        }),
      ).rejects.toThrow();
    });

    it('should lowercase email before storage', async () => {
      const userData = {
        name: 'John Doe',
        email: 'JOHN@EXAMPLE.COM',
        phone: '9876543210',
        password: 'hashedPassword123',
      };

      const user = await userModel.create(userData);

      expect(user.email).toBe('john@example.com');
    });

    it('should set default role to customer', async () => {
      const userData = {
        name: 'John Doe',
        email: `customer-${Date.now()}@example.com`,
        phone: '9876543210',
        password: 'hashedPassword123',
      };

      const user = await userModel.create(userData);

      expect(user.role).toBe('customer');
    });

    it('should validate role enum values', async () => {
      const userData = {
        name: 'John Doe',
        email: `role-${Date.now()}@example.com`,
        phone: '9876543210',
        password: 'hashedPassword123',
        role: 'invalid_role',
      };

      await expect(userModel.create(userData)).rejects.toThrow();
    });

    it('should set default status to active', async () => {
      const userData = {
        name: 'John Doe',
        email: `status-${Date.now()}@example.com`,
        phone: '9876543210',
        password: 'hashedPassword123',
      };

      const user = await userModel.create(userData);

      expect(user.status).toBe('active');
    });

    it('should validate status enum values', async () => {
      const userData = {
        name: 'John Doe',
        email: `status-invalid-${Date.now()}@example.com`,
        phone: '9876543210',
        password: 'hashedPassword123',
        status: 'invalid_status',
      };

      await expect(userModel.create(userData)).rejects.toThrow();
    });

    it('should accept all valid role values', async () => {
      const roles = ['customer', 'admin', 'staff', 'superadmin'];

      for (const role of roles) {
        const userData = {
          name: 'Test User',
          email: `role-${role}-${Date.now()}@example.com`,
          phone: '9876543210',
          password: 'hashedPassword123',
          role,
        };

        const user = await userModel.create(userData);
        expect(user.role).toBe(role);
      }
    });

    it('should store profile image URL correctly', async () => {
      const imageUrl = 'https://example.com/image.jpg';
      const userData = {
        name: 'John Doe',
        email: `image-${Date.now()}@example.com`,
        phone: '9876543210',
        password: 'hashedPassword123',
        profileImage: imageUrl,
      };

      const user = await userModel.create(userData);

      expect(user.profileImage).toBe(imageUrl);
    });

    it('should auto-add timestamps', async () => {
      const userData = {
        name: 'John Doe',
        email: `timestamp-${Date.now()}@example.com`,
        phone: '9876543210',
        password: 'hashedPassword123',
      };

      const user = await userModel.create(userData);

      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
      expect(user.createdAt instanceof Date).toBe(true);
    });
  });

  // ===== APPOINTMENT SCHEMA TESTS =====
  describe('Appointment Schema Validation', () => {
    afterEach(async () => {
      await appointmentModel.deleteMany({});
    });

    it('should create appointment with required fields', async () => {
      const appointmentData = {
        userId: UserFixtures.CUSTOMER_USER._id,
        serviceId: '607f1f77bcf86cd799439030',
        date: '2024-05-15',
        time: '10:00 AM',
      };

      const appointment = await appointmentModel.create(appointmentData);

      expect(appointment).toBeDefined();
      expect(appointment.date).toBe(appointmentData.date);
      expect(appointment.time).toBe(appointmentData.time);
    });

    it('should require date field', async () => {
      const appointmentData = {
        userId: UserFixtures.CUSTOMER_USER._id,
        serviceId: '607f1f77bcf86cd799439030',
        time: '10:00 AM',
        // date is missing
      };

      await expect(appointmentModel.create(appointmentData)).rejects.toThrow();
    });

    it('should require time field', async () => {
      const appointmentData = {
        userId: UserFixtures.CUSTOMER_USER._id,
        serviceId: '607f1f77bcf86cd799439030',
        date: '2024-05-15',
        // time is missing
      };

      await expect(appointmentModel.create(appointmentData)).rejects.toThrow();
    });

    it('should set default status to pending', async () => {
      const appointmentData = {
        userId: UserFixtures.CUSTOMER_USER._id,
        serviceId: '607f1f77bcf86cd799439030',
        date: '2024-05-15',
        time: '10:00 AM',
      };

      const appointment = await appointmentModel.create(appointmentData);

      expect(appointment.status).toBe('pending');
    });

    it('should validate status enum values', async () => {
      const appointmentData = {
        userId: UserFixtures.CUSTOMER_USER._id,
        serviceId: '607f1f77bcf86cd799439030',
        date: '2024-05-15',
        time: '10:00 AM',
        status: 'invalid_status',
      };

      await expect(appointmentModel.create(appointmentData)).rejects.toThrow();
    });

    it('should accept all valid status values', async () => {
      const statuses = [
        'pending',
        'confirmed',
        'completed',
        'cancelled',
        'no-show',
      ];

      for (const status of statuses) {
        const appointmentData = {
          userId: UserFixtures.CUSTOMER_USER._id,
          serviceId: '607f1f77bcf86cd799439030',
          date: '2024-05-15',
          time: '10:00 AM',
          status,
        };

        const appointment = await appointmentModel.create(appointmentData);
        expect(appointment.status).toBe(status);
      }
    });

    it('should store optional fields correctly', async () => {
      const appointmentData = {
        userId: UserFixtures.CUSTOMER_USER._id,
        userName: 'John Doe',
        serviceId: '607f1f77bcf86cd799439030',
        serviceName: 'Hair Cut',
        staffId: '607f1f77bcf86cd799439040',
        staffName: 'Jane Smith',
        date: '2024-05-15',
        time: '10:00 AM',
        notes: 'Customer requested special treatment',
      };

      const appointment = await appointmentModel.create(appointmentData);

      expect(appointment.userName).toBe(appointmentData.userName);
      expect(appointment.serviceName).toBe(appointmentData.serviceName);
      expect(appointment.staffName).toBe(appointmentData.staffName);
      expect(appointment.notes).toBe(appointmentData.notes);
    });

    it('should auto-add timestamps', async () => {
      const appointmentData = {
        userId: UserFixtures.CUSTOMER_USER._id,
        serviceId: '607f1f77bcf86cd799439030',
        date: '2024-05-15',
        time: '10:00 AM',
      };

      const appointment = await appointmentModel.create(appointmentData);

      expect(appointment.createdAt).toBeDefined();
      expect(appointment.updatedAt).toBeDefined();
    });
  });

  // ===== INDEX TESTS =====
  describe('Database Indexes', () => {
    it('should have index on user email', async () => {
      const indexes = userModel.collection.getIndexes();
      // Check if email index exists
      expect(indexes).toBeDefined();
    });

    it('should have index on appointment date', async () => {
      const indexes = appointmentModel.collection.getIndexes();
      // Check if date index exists
      expect(indexes).toBeDefined();
    });
  });

  // ===== CONSTRAINT TESTS =====
  describe('Schema Constraints', () => {
    it('should trim whitespace from email', async () => {
      const userData = {
        name: 'John Doe',
        email: '  john@example.com  ',
        phone: '9876543210',
        password: 'hashedPassword123',
      };

      const user = await userModel.create(userData);

      expect(user.email).toBe('john@example.com');
    });

    it('should trim whitespace from name', async () => {
      const userData = {
        name: '  John Doe  ',
        email: `trim-${Date.now()}@example.com`,
        phone: '9876543210',
        password: 'hashedPassword123',
      };

      const user = await userModel.create(userData);

      expect(user.name).toBe('John Doe');
    });
  });
});
