/**
 * Complete E2E Tests - Full User Workflows
 * Tests complete user journeys from authentication through appointments to payments
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AppModule } from '../../src/app.module';
import { UserFixtures } from '../fixtures/users.fixture';
import { AppointmentFixtures } from '../fixtures/appointments.fixture';
import { PaymentFixtures } from '../fixtures/payments.fixture';
import { GlobalExceptionFilter } from '../../src/common/filters/http-exception.filter';

describe('Beauty Parlour E2E Tests', () => {
  jest.setTimeout(60000); // Increase timeout for MongoMemoryServer startup
  
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let accessToken: string;
  let userId: string;
  let appointmentId: string;

  beforeAll(async () => {
    // Start in-memory MongoDB
    mongoServer = await MongoMemoryServer.create({
      instance: { startupTimeout: 60000 },
    });
    const mongoUri = mongoServer.getUri();
    process.env.MONGODB_URI = mongoUri;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalFilters(new GlobalExceptionFilter());
    await app.init();

    // Seed default product and service to avoid catalog browsing and order placement failures in clean DBs
    const productModel = app.get(getModelToken('Product'));
    const beautyServiceModel = app.get(getModelToken('BeautyService'));

    await productModel.create({
      _id: '507f1f77bcf86cd799439011',
      name: 'Shampoo',
      price: 25.0,
      originalPrice: 30.0,
      category: 'Hair Care',
      stock: 100,
      description: 'Nourishing hair shampoo',
      isActive: true,
    });

    await beautyServiceModel.create({
      _id: '607f1f77bcf86cd799439030',
      name: 'Hair Cut',
      price: 50.0,
      duration: 30,
      category: 'Hair',
      isActive: true,
    });
  });

  afterAll(async () => {
    await app.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  // ===== AUTH FLOW =====
  describe('Authentication Flow (E2E)', () => {
    it('should complete full auth flow: register -> login -> logout', async () => {
      const uniqueEmail = `auth-flow-${Date.now()}@example.com`;
      // 1. Register a new user
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...UserFixtures.VALID_REGISTER_DTO,
          email: uniqueEmail,
        })
        .expect(201);

      expect(registerResponse.body).toHaveProperty('accessToken');
      expect(registerResponse.body).toHaveProperty('refreshToken');
      expect(registerResponse.body).toHaveProperty('user');
      expect(registerResponse.body.user.email).toBe(uniqueEmail);

      accessToken = registerResponse.body.accessToken;
      userId = registerResponse.body.user._id;

      // 2. Login with registered user
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: uniqueEmail,
          password: UserFixtures.VALID_REGISTER_DTO.password,
        })
        .expect(200);

      expect(loginResponse.body).toHaveProperty('accessToken');
      expect(loginResponse.body).toHaveProperty('refreshToken');
      accessToken = loginResponse.body.accessToken;

      // 3. Get profile with token
      const profileResponse = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(profileResponse.body).toHaveProperty('_id');
      expect(profileResponse.body.email).toBe(uniqueEmail);

      // 4. Logout
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('should handle refresh token flow', async () => {
      // Register and login
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...UserFixtures.VALID_REGISTER_DTO,
          email: `refresh-test-${Date.now()}@example.com`,
        })
        .expect(201);

      const refreshToken = registerResponse.body.refreshToken;

      // Use refresh token to get new access token
      const refreshResponse = await request(app.getHttpServer())
        .post('/auth/refresh-token')
        .send({ refreshToken })
        .expect(200);

      expect(refreshResponse.body).toHaveProperty('accessToken');
      expect(typeof refreshResponse.body.accessToken).toBe('string');
    });

    it('should reject login with wrong password', async () => {
      const testEmail = `wrong-pwd-${Date.now()}@example.com`;
      // First register a user
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...UserFixtures.VALID_REGISTER_DTO,
          email: testEmail,
        })
        .expect(201);

      // Try to login with wrong password
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testEmail,
          password: 'wrongpassword123',
        })
        .expect(401);
    });

    it('should reject access without authorization header', async () => {
      await request(app.getHttpServer()).get('/auth/profile').expect(401); // Unauthorized
    });
  });

  // ===== APPOINTMENT FLOW =====
  describe('Appointment Management Flow (E2E)', () => {
    beforeEach(async () => {
      // Register and login before each test
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...UserFixtures.VALID_REGISTER_DTO,
          email: `apt-test-${Date.now()}@example.com`,
          phone: `999${Math.floor(1000000 + Math.random() * 9000000)}`,
        })
        .expect(201);

      accessToken = registerResponse.body.accessToken;
      userId = registerResponse.body.user._id;
    });

    it('should create and manage appointment lifecycle', async () => {
      // Login as admin to get admin token for status updates
      const adminLoginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'admin@beauty.com',
          password: 'admin123',
        })
        .expect(200);

      const adminToken = adminLoginResponse.body.accessToken;

      // 1. Create appointment
      const createResponse = await request(app.getHttpServer())
        .post('/appointments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(AppointmentFixtures.VALID_CREATE_DTO)
        .expect(201);

      expect(createResponse.body).toHaveProperty('_id');
      expect(createResponse.body.status).toBe('pending');
      appointmentId = createResponse.body._id;

      // 2. Get appointment
      const getResponse = await request(app.getHttpServer())
        .get(`/appointments/${appointmentId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(getResponse.body._id).toBe(appointmentId);

      // 3. Update appointment status to confirmed
      const updateStatusResponse = await request(app.getHttpServer())
        .put(`/appointments/status/${appointmentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'confirmed' })
        .expect(200);

      expect(updateStatusResponse.body.status).toBe('confirmed');

      // 4. Update appointment notes
      const updateResponse = await request(app.getHttpServer())
        .put(`/appointments/${appointmentId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ notes: 'Please arrive 10 minutes early' })
        .expect(200);

      expect(updateResponse.body.notes).toBe('Please arrive 10 minutes early');

      // 5. Get user appointments
      const userAppointmentsResponse = await request(app.getHttpServer())
        .get(`/appointments/user/${userId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(userAppointmentsResponse.body)).toBe(true);
      expect(userAppointmentsResponse.body.length).toBeGreaterThanOrEqual(1);

      // 6. Cancel appointment
      const cancelResponse = await request(app.getHttpServer())
        .put(`/appointments/status/${appointmentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'cancelled' })
        .expect(200);

      expect(cancelResponse.body.status).toBe('cancelled');
    });

    it('should reject invalid appointment creation', async () => {
      await request(app.getHttpServer())
        .post('/appointments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(AppointmentFixtures.INVALID_PAST_DATE_DTO)
        .expect(400); // Bad request
    });

    it('should prevent unauthorized appointment access', async () => {
      // Create appointment with one user
      const createResponse = await request(app.getHttpServer())
        .post('/appointments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(AppointmentFixtures.VALID_CREATE_DTO)
        .expect(201);

      appointmentId = createResponse.body._id;

      // Register different user
      const otherUserResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...UserFixtures.VALID_REGISTER_DTO,
          email: `other-user-${Date.now()}@example.com`,
          phone: `999${Math.floor(1000000 + Math.random() * 9000000)}`,
        })
        .expect(201);

      const otherUserToken = otherUserResponse.body.accessToken;

      // Other user should not be able to delete the appointment
      await request(app.getHttpServer())
        .delete(`/appointments/${appointmentId}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(403);
    });
  });

  // ===== PAYMENT FLOW =====
  describe('Payment Processing Flow (E2E)', () => {
    let orderId: string;

    beforeEach(async () => {
      // Register and create appointment
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...UserFixtures.VALID_REGISTER_DTO,
          email: `payment-test-${Date.now()}@example.com`,
        })
        .expect(201);

      accessToken = registerResponse.body.accessToken;
      userId = registerResponse.body.user._id;

      // Browse available products
      const productsResponse = await request(app.getHttpServer())
        .get('/products')
        .expect(200);

      const product = productsResponse.body[0];
      const prodId = product ? product._id : '507f1f77bcf86cd799439011';
      const prodName = product ? product.name : 'Shampoo';
      const prodPrice = product ? product.price : 25.0;

      // Create an order first
      const orderResponse = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          userId,
          items: [
            {
              productId: prodId,
              productName: prodName,
              quantity: 1,
              price: prodPrice
            }
          ],
          totalPrice: prodPrice
        })
        .expect(201);

      orderId = orderResponse.body._id;
    });

    it('should process complete payment flow', async () => {
      // 1. Create payment
      const paymentResponse = await request(app.getHttpServer())
        .post('/payments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          orderId,
          method: 'cash',
          amount: 50.0,
        })
        .expect(201);

      expect(paymentResponse.body).toHaveProperty('_id');
      expect(paymentResponse.body.status).toBe('pending');

      const paymentId = paymentResponse.body._id;

      // 2. Get payment details
      const getPaymentResponse = await request(app.getHttpServer())
        .get(`/payments/${paymentId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(getPaymentResponse.body._id).toBe(paymentId);

      // 3. Simulate payment success
      const processResponse = await request(app.getHttpServer())
        .post(`/payments/${paymentId}/confirm`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ transactionId: 'txn_test_123' })
        .expect(200);

      expect(processResponse.body.status).toBe('completed');

      // 4. Get invoice
      const invoiceResponse = await request(app.getHttpServer())
        .get(`/payments/${paymentId}/invoice`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(invoiceResponse.body).toHaveProperty('invoiceId');
      expect(invoiceResponse.body).toHaveProperty('amount');
    });

    it('should reject invalid payment amounts', async () => {
      await request(app.getHttpServer())
        .post('/payments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          orderId,
          method: 'cash',
          amount: -50.0,
        })
        .expect(400);
    });
  });

  // ===== COMPREHENSIVE USER JOURNEY =====
  describe('Complete User Journey (E2E)', () => {
    it('should complete full user journey: register -> book appointment -> pay -> get invoice', async () => {
      // 1. User registers
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...UserFixtures.VALID_REGISTER_DTO,
          email: `journey-${Date.now()}@example.com`,
        })
        .expect(201);

      const token = registerResponse.body.accessToken;
      const userId = registerResponse.body.user._id;

      expect(registerResponse.body).toHaveProperty('accessToken');

      // 2. Browse available services
      const servicesResponse = await request(app.getHttpServer())
        .get('/services')
        .expect(200);

      expect(Array.isArray(servicesResponse.body)).toBe(true);
      const serviceId = servicesResponse.body[0]?._id;

      // 3. Book appointment
      const appointmentResponse = await request(app.getHttpServer())
        .post('/appointments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          serviceId,
          date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          time: '02:00 PM',
          notes: 'First time customer',
        })
        .expect(201);

      const appointmentId = appointmentResponse.body._id;

      // 4. Confirm appointment status (needs admin login first)
      const adminLoginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'admin@beauty.com',
          password: 'admin123',
        })
        .expect(200);

      const adminToken = adminLoginResponse.body.accessToken;

      await request(app.getHttpServer())
        .put(`/appointments/status/${appointmentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'confirmed' })
        .expect(200);

      // Browse available products
      const productsResponse = await request(app.getHttpServer())
        .get('/products')
        .expect(200);

      const product = productsResponse.body[0];
      const prodId = product ? product._id : '507f1f77bcf86cd799439011';
      const prodName = product ? product.name : 'Shampoo';
      const prodPrice = product ? product.price : 25.0;

      // Create an order first for the payment
      const orderResponse = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          userId,
          items: [
            {
              productId: prodId,
              productName: prodName,
              quantity: 1,
              price: prodPrice
            }
          ],
          totalPrice: prodPrice
        })
        .expect(201);

      const orderId = orderResponse.body._id;

      // 5. Process payment
      const paymentResponse = await request(app.getHttpServer())
        .post('/payments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          orderId,
          method: 'cash',
          amount: 50.0,
        })
        .expect(201);

      const paymentId = paymentResponse.body._id;

      // 6. Confirm payment
      await request(app.getHttpServer())
        .post(`/payments/${paymentId}/confirm`)
        .set('Authorization', `Bearer ${token}`)
        .send({ transactionId: 'txn_success_123' })
        .expect(200);

      // 7. Get invoice
      const invoiceResponse = await request(app.getHttpServer())
        .get(`/payments/${paymentId}/invoice`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(invoiceResponse.body).toHaveProperty('invoiceId');
      expect(invoiceResponse.body).toHaveProperty('appointmentDetails');

      // 8. Get user profile (should show updated info)
      const profileResponse = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(profileResponse.body._id).toBe(userId);
    });
  });

  // ===== ERROR HANDLING =====
  describe('Error Handling (E2E)', () => {
    it('should handle missing authentication gracefully', async () => {
      await request(app.getHttpServer()).get('/appointments').expect(401);
    });

    it('should handle invalid JWT token', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);
    });

    it('should handle non-existent resource', async () => {
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...UserFixtures.VALID_REGISTER_DTO,
          email: `404-test-${Date.now()}@example.com`,
        })
        .expect(201);

      const token = registerResponse.body.accessToken;

      await request(app.getHttpServer())
        .get('/appointments/nonexistent-id')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });

    it('should handle server errors gracefully', async () => {
      // Try to create appointment with invalid data
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...UserFixtures.VALID_REGISTER_DTO,
          email: `error-test-${Date.now()}@example.com`,
        })
        .expect(201);

      const token = registerResponse.body.accessToken;

      await request(app.getHttpServer())
        .post('/appointments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          // Missing required fields
          date: '2024-05-20',
        })
        .expect(400); // Bad request
    });
  });
});
