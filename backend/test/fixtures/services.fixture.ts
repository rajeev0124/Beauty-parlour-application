/**
 * Beauty Service Test Fixtures
 * Provides consistent service/beauty service data for testing
 */

import { Types } from 'mongoose';

export class ServiceFixtures {
  static readonly HAIRCUT_SERVICE = {
    _id: new Types.ObjectId('607f1f77bcf86cd799439030'),
    name: 'Hair Cut',
    description: 'Professional hair cutting service',
    category: 'Hair',
    price: 50.0,
    duration: 30,
    duration_unit: 'minutes',
    isActive: true,
    image: 'https://example.com/haircut.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  static readonly FACIAL_SERVICE = {
    _id: new Types.ObjectId('607f1f77bcf86cd799439031'),
    name: 'Facial',
    description: 'Hydrating facial treatment',
    category: 'Skin Care',
    price: 75.0,
    duration: 60,
    duration_unit: 'minutes',
    isActive: true,
    image: 'https://example.com/facial.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  static readonly MANICURE_SERVICE = {
    _id: new Types.ObjectId('607f1f77bcf86cd799439032'),
    name: 'Manicure',
    description: 'Gel manicure with nail design',
    category: 'Nails',
    price: 40.0,
    duration: 45,
    duration_unit: 'minutes',
    isActive: true,
    image: 'https://example.com/manicure.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  static readonly PEDICURE_SERVICE = {
    _id: new Types.ObjectId('607f1f77bcf86cd799439033'),
    name: 'Pedicure',
    description: 'Full pedicure treatment',
    category: 'Nails',
    price: 50.0,
    duration: 50,
    duration_unit: 'minutes',
    isActive: true,
    image: 'https://example.com/pedicure.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  static readonly INACTIVE_SERVICE = {
    _id: new Types.ObjectId('607f1f77bcf86cd799439034'),
    name: 'Special Treatment',
    description: 'Currently unavailable',
    category: 'Special',
    price: 100.0,
    duration: 90,
    duration_unit: 'minutes',
    isActive: false,
    image: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-03-01'),
  };

  // Create Service DTO fixtures
  static readonly VALID_CREATE_DTO = {
    name: 'New Treatment',
    description: 'Amazing new beauty treatment',
    category: 'Spa',
    price: 125.0,
    duration: 90,
    duration_unit: 'minutes',
    image: 'https://example.com/treatment.jpg',
  };

  static readonly INVALID_PRICE_DTO = {
    name: 'Invalid Service',
    description: 'Service with invalid price',
    category: 'Spa',
    price: -50.0, // Negative price
    duration: 60,
    duration_unit: 'minutes',
    image: null,
  };

  static readonly MISSING_NAME_DTO = {
    // name is missing
    description: 'Service without name',
    category: 'Spa',
    price: 100.0,
    duration: 60,
    duration_unit: 'minutes',
    image: null,
  };

  static readonly INVALID_DURATION_DTO = {
    name: 'Invalid Duration Service',
    description: 'Service with invalid duration',
    category: 'Spa',
    price: 100.0,
    duration: -30, // Negative duration
    duration_unit: 'minutes',
    image: null,
  };

  /**
   * Get service by category
   */
  static getServiceByCategory(category: string) {
    const services = {
      Hair: this.HAIRCUT_SERVICE,
      'Skin Care': this.FACIAL_SERVICE,
      Nails: this.MANICURE_SERVICE,
      Spa: this.PEDICURE_SERVICE,
    };
    return services[category];
  }

  /**
   * Get all test services
   */
  static getAllServices() {
    return [
      this.HAIRCUT_SERVICE,
      this.FACIAL_SERVICE,
      this.MANICURE_SERVICE,
      this.PEDICURE_SERVICE,
      this.INACTIVE_SERVICE,
    ];
  }

  /**
   * Get only active services
   */
  static getActiveServices() {
    return [
      this.HAIRCUT_SERVICE,
      this.FACIAL_SERVICE,
      this.MANICURE_SERVICE,
      this.PEDICURE_SERVICE,
    ];
  }

  /**
   * Create a custom service
   */
  static createCustomService(
    overrides: Partial<typeof this.HAIRCUT_SERVICE> = {},
  ) {
    return {
      ...this.HAIRCUT_SERVICE,
      _id: new Types.ObjectId(),
      ...overrides,
    };
  }

  /**
   * Create service with specific price
   */
  static createServiceWithPrice(price: number) {
    return this.createCustomService({
      price,
      name: `Service - $${price}`,
    });
  }
}
