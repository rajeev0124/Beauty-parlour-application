/**
 * Product Test Fixtures
 * Provides consistent product data for testing inventory and product management
 */

import { Types } from 'mongoose';

export class ProductFixtures {
  static readonly SHAMPOO_PRODUCT = {
    _id: new Types.ObjectId('707f1f77bcf86cd799439030'),
    name: 'Premium Shampoo',
    description: 'Professional grade shampoo for all hair types',
    sku: 'SHAMPOO-001',
    category: 'Hair Care',
    price: 25.0,
    quantity: 100,
    minStock: 20,
    supplier: 'Beauty Supplies Inc',
    expiryDate: new Date('2025-12-31'),
    image: 'https://example.com/shampoo.jpg',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  static readonly CONDITIONER_PRODUCT = {
    _id: new Types.ObjectId('707f1f77bcf86cd799439031'),
    name: 'Deep Conditioning Mask',
    description: 'Intensive hair conditioning treatment',
    sku: 'COND-001',
    category: 'Hair Care',
    price: 35.0,
    quantity: 50,
    minStock: 10,
    supplier: 'Beauty Supplies Inc',
    expiryDate: new Date('2025-10-31'),
    image: 'https://example.com/conditioner.jpg',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  static readonly NAIL_POLISH_PRODUCT = {
    _id: new Types.ObjectId('707f1f77bcf86cd799439032'),
    name: 'Gel Nail Polish - Red',
    description: 'Long-lasting gel nail polish',
    sku: 'GNAIL-RED-001',
    category: 'Nail Products',
    price: 15.0,
    quantity: 200,
    minStock: 30,
    supplier: 'Nail Art Plus',
    expiryDate: new Date('2026-06-30'),
    image: 'https://example.com/nail-polish.jpg',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  static readonly LOW_STOCK_PRODUCT = {
    _id: new Types.ObjectId('707f1f77bcf86cd799439033'),
    name: 'Facial Moisturizer',
    description: 'Hydrating facial moisturizer',
    sku: 'MOISTURIZER-001',
    category: 'Skin Care',
    price: 45.0,
    quantity: 5, // Low stock
    minStock: 20,
    supplier: 'Skin Care Experts',
    expiryDate: new Date('2025-08-31'),
    image: 'https://example.com/moisturizer.jpg',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  static readonly EXPIRED_PRODUCT = {
    _id: new Types.ObjectId('707f1f77bcf86cd799439034'),
    name: 'Expired Face Wash',
    description: 'Expired product',
    sku: 'FACEWASH-EXPIRED-001',
    category: 'Skin Care',
    price: 20.0,
    quantity: 10,
    minStock: 5,
    supplier: 'Skin Care Experts',
    expiryDate: new Date('2023-12-31'), // Expired
    image: null,
    isActive: false,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  // Create Product DTO fixtures
  static readonly VALID_CREATE_DTO = {
    name: 'New Beauty Product',
    description: 'Excellent new product',
    sku: 'NEW-PRODUCT-001',
    category: 'Skin Care',
    price: 50.0,
    quantity: 100,
    minStock: 20,
    supplier: 'Quality Supplier',
    expiryDate: '2025-12-31',
  };

  static readonly INVALID_PRICE_DTO = {
    name: 'Invalid Price Product',
    description: 'Product with invalid price',
    sku: 'INVALID-PRICE-001',
    category: 'Hair Care',
    price: -25.0, // Negative price
    quantity: 50,
    minStock: 10,
    supplier: 'Some Supplier',
    expiryDate: '2025-12-31',
  };

  static readonly INVALID_QUANTITY_DTO = {
    name: 'Invalid Quantity Product',
    description: 'Product with invalid quantity',
    sku: 'INVALID-QTY-001',
    category: 'Hair Care',
    price: 30.0,
    quantity: -50, // Negative quantity
    minStock: 10,
    supplier: 'Some Supplier',
    expiryDate: '2025-12-31',
  };

  static readonly MISSING_SKU_DTO = {
    name: 'Missing SKU Product',
    description: 'Product without SKU',
    // sku is missing
    category: 'Hair Care',
    price: 30.0,
    quantity: 50,
    minStock: 10,
    supplier: 'Some Supplier',
    expiryDate: '2025-12-31',
  };

  /**
   * Get all test products
   */
  static getAllProducts() {
    return [
      this.SHAMPOO_PRODUCT,
      this.CONDITIONER_PRODUCT,
      this.NAIL_POLISH_PRODUCT,
      this.LOW_STOCK_PRODUCT,
      this.EXPIRED_PRODUCT,
    ];
  }

  /**
   * Get only active products
   */
  static getActiveProducts() {
    return [
      this.SHAMPOO_PRODUCT,
      this.CONDITIONER_PRODUCT,
      this.NAIL_POLISH_PRODUCT,
      this.LOW_STOCK_PRODUCT,
    ];
  }

  /**
   * Get products with low stock
   */
  static getLowStockProducts() {
    return this.getAllProducts().filter((p) => p.quantity <= p.minStock);
  }

  /**
   * Get expired products
   */
  static getExpiredProducts() {
    const now = new Date();
    return this.getAllProducts().filter((p) => new Date(p.expiryDate) < now);
  }

  /**
   * Create a custom product
   */
  static createCustomProduct(
    overrides: Partial<typeof this.SHAMPOO_PRODUCT> = {},
  ) {
    return {
      ...this.SHAMPOO_PRODUCT,
      _id: new Types.ObjectId(),
      ...overrides,
    };
  }

  /**
   * Create product with specific price
   */
  static createProductWithPrice(price: number) {
    return this.createCustomProduct({
      price,
      name: `Product - $${price}`,
    });
  }
}
