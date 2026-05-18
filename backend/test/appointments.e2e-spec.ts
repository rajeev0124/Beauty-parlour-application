import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';

jest.setTimeout(60000);

describe('AppointmentsController (e2e)', () => {
  let app: INestApplication;
  let mongo: MongoMemoryServer;
  let connection: Connection;
  let authToken: string;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create({
      instance: { startupTimeout: 60000 },
    });
    const uri = mongo.getUri();
    process.env.MONGODB_URI = uri;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    connection = app.get(getConnectionToken());

    // Create a user and get token for auth-protected routes
    await request(app.getHttpServer()).post('/auth/register').send({
      email: 'test@example.com',
      password: 'Password123!',
      name: 'Test User',
      phone: '9876543210',
    });

    // Set role to admin manually in DB since register defaults to customer
    const userModel = app.get(getModelToken('User'));
    await userModel.updateOne(
      { email: 'test@example.com' },
      { $set: { role: 'admin' } },
    );

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Password123!',
      });

    authToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    if (connection) await connection.close();
    if (mongo) await mongo.stop();
    if (app) await app.close();
  });

  it('/appointments (POST) - Success', async () => {
    const payload = {
      serviceId: '507f1f77bcf86cd799439011',
      serviceName: 'Test Service',
      staffId: '507f1f77bcf86cd799439012',
      date: '2026-06-01',
      time: '02:00 PM',
      notes: 'Test appointment',
    };

    const response = await request(app.getHttpServer())
      .post('/appointments')
      .set('Authorization', `Bearer ${authToken}`)
      .send(payload)
      .expect(201);

    expect(response.body).toHaveProperty('_id');
    expect(response.body.status).toBe('pending');
  });

  it('/appointments (GET) - Success', async () => {
    const response = await request(app.getHttpServer())
      .get('/appointments')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('/appointments/status/:id (PUT) - Success', async () => {
    // First get an appointment ID
    const listResponse = await request(app.getHttpServer())
      .get('/appointments')
      .set('Authorization', `Bearer ${authToken}`);

    const id = listResponse.body[0]._id;

    const response = await request(app.getHttpServer())
      .put(`/appointments/status/${id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'confirmed' })
      .expect(200);

    expect(response.body.status).toBe('confirmed');
  });
});
