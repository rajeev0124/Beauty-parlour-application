/**
 * Test Helpers - Utility functions for common testing operations
 * These helpers reduce boilerplate and make tests more readable
 */

import { JwtService } from '@nestjs/jwt';

/**
 * JWT Helper - Generate and verify tokens for testing
 */
export class JwtTestHelper {
  constructor(private jwtService: JwtService) {}

  /**
   * Generate a valid JWT token for testing
   */
  generateToken(payload: any, expiresIn: string = '1h'): string {
    return this.jwtService.sign(payload, { expiresIn });
  }

  /**
   * Generate token for a customer user
   */
  generateCustomerToken(userId: string = '507f1f77bcf86cd799439011'): string {
    return this.generateToken({
      sub: userId,
      role: 'customer',
      email: 'customer@example.com',
    });
  }

  /**
   * Generate token for an admin user
   */
  generateAdminToken(userId: string = '507f1f77bcf86cd799439012'): string {
    return this.generateToken({
      sub: userId,
      role: 'admin',
      email: 'admin@example.com',
    });
  }

  /**
   * Generate token for staff user
   */
  generateStaffToken(userId: string = '507f1f77bcf86cd799439013'): string {
    return this.generateToken({
      sub: userId,
      role: 'staff',
      email: 'staff@example.com',
    });
  }

  /**
   * Generate token for superadmin
   */
  generateSuperAdminToken(userId: string = '507f1f77bcf86cd799439014'): string {
    return this.generateToken({
      sub: userId,
      role: 'superadmin',
      email: 'superadmin@example.com',
    });
  }

  /**
   * Generate expired token
   */
  generateExpiredToken(payload: any): string {
    return this.jwtService.sign(payload, { expiresIn: '-1h' });
  }

  /**
   * Verify if token is valid
   */
  verifyToken(token: string): any {
    try {
      return this.jwtService.verify(token);
    } catch {
      return null;
    }
  }
}

/**
 * Database Helper - Common database operations for testing
 */
export class DatabaseTestHelper {
  /**
   * Create a mock MongoDB ObjectId
   */
  static createObjectId(id?: string): string {
    if (id) return id;
    const chars = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < 24; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Check if string is valid MongoDB ObjectId
   */
  static isValidObjectId(id: string): boolean {
    return /^[a-f\d]{24}$/i.test(id);
  }

  /**
   * Generate mock Mongoose document
   */
  static createMockDocument<T>(data: T): T & { toObject: () => T } {
    return {
      ...data,
      toObject: () => data,
    };
  }

  /**
   * Generate multiple mock documents
   */
  static createMockDocuments<T>(data: T[], count: number): T[] {
    return Array.from({ length: count }, (_, i) => ({
      ...data[i % data.length],
    }));
  }
}

/**
 * HTTP Request Builder - Build test requests with common setups
 */
export class RequestBuilder {
  private method: string = 'GET';
  private url: string = '';
  private body: any = null;
  private headers: Record<string, string> = {};
  private query: Record<string, string> = {};

  /**
   * Set HTTP method
   */
  setMethod(method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'): this {
    this.method = method;
    return this;
  }

  /**
   * Set request URL
   */
  setUrl(url: string): this {
    this.url = url;
    return this;
  }

  /**
   * Set request body
   */
  setBody(body: any): this {
    this.body = body;
    return this;
  }

  /**
   * Add authorization header with JWT token
   */
  setAuthorization(token: string): this {
    this.headers['Authorization'] = `Bearer ${token}`;
    return this;
  }

  /**
   * Set content type
   */
  setContentType(contentType: string): this {
    this.headers['Content-Type'] = contentType;
    return this;
  }

  /**
   * Add custom header
   */
  addHeader(key: string, value: string): this {
    this.headers[key] = value;
    return this;
  }

  /**
   * Add query parameter
   */
  addQuery(key: string, value: string): this {
    this.query[key] = value;
    return this;
  }

  /**
   * Build request object
   */
  build() {
    let url = this.url;
    const queryString = new URLSearchParams(this.query).toString();
    if (queryString) {
      url += `?${queryString}`;
    }

    return {
      method: this.method,
      url,
      body: this.body,
      headers: {
        'Content-Type': 'application/json',
        ...this.headers,
      },
    };
  }
}

/**
 * Response Assertion Helper - Common response validations
 */
export class ResponseAssertion {
  /**
   * Assert successful response
   */
  static assertSuccess(response: any, expectedStatus: number = 200): void {
    expect(response.status).toBe(expectedStatus);
    expect(response.body).toBeDefined();
  }

  /**
   * Assert error response
   */
  static assertError(
    response: any,
    expectedStatus: number,
    errorMessage?: string,
  ): void {
    expect(response.status).toBe(expectedStatus);
    expect(response.body.message).toBeDefined();
    if (errorMessage) {
      expect(response.body.message).toContain(errorMessage);
    }
  }

  /**
   * Assert response has required fields
   */
  static assertHasFields(response: any, fields: string[]): void {
    fields.forEach((field) => {
      expect(response.body).toHaveProperty(field);
    });
  }

  /**
   * Assert pagination response
   */
  static assertPaginatedResponse(response: any, pageSize?: number): void {
    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('total');
    expect(response.body).toHaveProperty('page');
    expect(response.body).toHaveProperty('limit');
    if (pageSize) {
      expect(response.body.data.length).toBeLessThanOrEqual(pageSize);
    }
  }

  /**
   * Assert token in response
   */
  static assertTokenInResponse(
    response: any,
    tokenField: string = 'accessToken',
  ): void {
    expect(response.body).toHaveProperty(tokenField);
    expect(typeof response.body[tokenField]).toBe('string');
    expect(response.body[tokenField].length).toBeGreaterThan(0);
  }
}

/**
 * Mock Repository Helper - Create mock Mongoose repositories
 */
export class MockRepositoryHelper {
  /**
   * Create mock model with common methods
   */
  static createMockModel(data: any = {}) {
    return {
      findById: jest.fn().mockResolvedValue(data),
      find: jest.fn().mockResolvedValue([data]),
      findOne: jest.fn().mockResolvedValue(data),
      findByIdAndUpdate: jest.fn().mockResolvedValue(data),
      findByIdAndDelete: jest.fn().mockResolvedValue(data),
      create: jest.fn().mockResolvedValue(data),
      updateOne: jest
        .fn()
        .mockResolvedValue({ acknowledged: true, modifiedCount: 1 }),
      deleteOne: jest
        .fn()
        .mockResolvedValue({ acknowledged: true, deletedCount: 1 }),
      countDocuments: jest.fn().mockResolvedValue(1),
      exec: jest.fn().mockResolvedValue(data),
    };
  }

  /**
   * Create mock model for list operations
   */
  static createMockModelWithList(data: any[], total: number = data.length) {
    const mockModel = this.createMockModel();
    mockModel.find = jest.fn().mockReturnValue({
      skip: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue(data),
      }),
      sort: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(data),
      }),
      exec: jest.fn().mockResolvedValue(data),
    });
    mockModel.countDocuments = jest.fn().mockResolvedValue(total);
    return mockModel;
  }
}
