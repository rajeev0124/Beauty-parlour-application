/**
 * Complete E2E Tests - Full User Workflows
 * Tests complete user journeys from authentication through appointments to payments
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AppModule } from '../../../app.module';
import { UserFixtures } from '../../../test/fixtures/users.fixture';
import { AppointmentFixtures } from '../../../test/fixtures/appointments.fixture';
import { PaymentFixtures } from '../../../test/fixtures/payments.fixture';

describe('Beauty Parlour E2E Tests', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let accessToken: string;
  let userId: string;
  let appointmentId: string;

  beforeAll(async () => {
    // Start in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('MONGODB_URI')
      .useValue(mongoUri)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
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
      // 1. Register a new user
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send(UserFixtures.VALID_REGISTER_DTO)
        .expect(201);

      expect(registerResponse.body).toHaveProperty('accessToken');
      expect(registerResponse.body).toHaveProperty('refreshToken');
      expect(registerResponse.body).toHaveProperty('user');
      expect(registerResponse.body.user.email).toBe(
        UserFixtures.VALID_REGISTER_DTO.email,
      );

      accessToken = registerResponse.body.accessToken;
      userId = registerResponse.body.user._id;

      // 2. Login with registered user
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: UserFixtures.VALID_REGISTER_DTO.email,
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
      expect(profileResponse.body.email).toBe(
        UserFixtures.VALID_REGISTER_DTO.email,
      );

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
      // First register a user
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...UserFixtures.VALID_REGISTER_DTO,
          email: `wrong-pwd-${Date.now()}@example.com`,
        })
        .expect(201);

      // Try to login with wrong password
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: UserFixtures.VALID_REGISTER_DTO.email,
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
        })
        .expect(201);

      accessToken = registerResponse.body.accessToken;
      userId = registerResponse.body.user._id;
    });

    it('should create and manage appointment lifecycle', async () => {
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
        .patch(`/appointments/${appointmentId}/status`)
        .set('Authorization', `Bearer ${accessToken}`)
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
        .patch(`/appointments/${appointmentId}/status`)
        .set('Authorization', `Bearer ${accessToken}`)
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
        })
        .expect(201);

      const otherUserToken = otherUserResponse.body.accessToken;

      // Other user should not be able to delete the appointment
      await request(app.getHttpServer())
        .delete(`/appointments/${appointmentId}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(403); // Forbidden (or 400/404 depending on implementation)
    });
  });

  // ===== PAYMENT FLOW =====
  describe('Payment Processing Flow (E2E)', () => {
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

      // Create an appointment
      const appointmentResponse = await request(app.getHttpServer())
        .post('/appointments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(AppointmentFixtures.VALID_CREATE_DTO)
        .expect(201);

      appointmentId = appointmentResponse.body._id;
    });

    it('should process complete payment flow', async () => {
      // 1. Create payment
      const paymentResponse = await request(app.getHttpServer())
        .post('/payments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          ...PaymentFixtures.VALID_PAYMENT_DTO,
          appointmentId,
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

      // 3. Simulate payment success (would normally be webhook from payment gateway)
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
          ...PaymentFixtures.INVALID_AMOUNT_DTO,
          appointmentId,
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
          date: '2024-05-20',
          time: '02:00 PM',
          notes: 'First time customer',
        })
        .expect(201);

      const appointmentId = appointmentResponse.body._id;

      // 4. Confirm appointment
      await request(app.getHttpServer())
        .patch(`/appointments/${appointmentId}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'confirmed' })
        .expect(200);

      // 5. Process payment
      const paymentResponse = await request(app.getHttpServer())
        .post('/payments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          appointmentId,
          amount: 75.0,
          currency: 'USD',
          method: 'credit_card',
          cardToken: 'tok_visa',
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
