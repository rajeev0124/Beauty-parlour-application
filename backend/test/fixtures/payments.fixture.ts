/**
 * Payment Test Fixtures
 * Provides consistent payment data for testing payment flows and transactions
 */

import { Types } from 'mongoose';

export class PaymentFixtures {
  static readonly COMPLETED_PAYMENT = {
    _id: new Types.ObjectId('607f1f77bcf86cd799439050'),
    userId: new Types.ObjectId('507f1f77bcf86cd799439011'),
    appointmentId: new Types.ObjectId('607f1f77bcf86cd799439020'),
    amount: 50.0,
    currency: 'USD',
    status: 'completed',
    method: 'credit_card',
    transactionId: 'txn_1234567890',
    invoiceId: 'INV-001',
    description: 'Payment for Hair Cut service',
    metadata: {
      cardLast4: '4242',
      brand: 'Visa',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  static readonly PENDING_PAYMENT = {
    _id: new Types.ObjectId('607f1f77bcf86cd799439051'),
    userId: new Types.ObjectId('507f1f77bcf86cd799439012'),
    appointmentId: new Types.ObjectId('607f1f77bcf86cd799439021'),
    amount: 75.0,
    currency: 'USD',
    status: 'pending',
    method: 'credit_card',
    transactionId: null,
    invoiceId: 'INV-002',
    description: 'Payment for Facial service',
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  static readonly FAILED_PAYMENT = {
    _id: new Types.ObjectId('607f1f77bcf86cd799439052'),
    userId: new Types.ObjectId('507f1f77bcf86cd799439013'),
    appointmentId: new Types.ObjectId('607f1f77bcf86cd799439022'),
    amount: 100.0,
    currency: 'USD',
    status: 'failed',
    method: 'credit_card',
    transactionId: null,
    invoiceId: 'INV-003',
    description: 'Payment for Spa Package',
    metadata: {
      failureReason: 'Insufficient funds',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  static readonly REFUNDED_PAYMENT = {
    _id: new Types.ObjectId('607f1f77bcf86cd799439053'),
    userId: new Types.ObjectId('507f1f77bcf86cd799439014'),
    appointmentId: new Types.ObjectId('607f1f77bcf86cd799439023'),
    amount: 60.0,
    currency: 'USD',
    status: 'refunded',
    method: 'credit_card',
    transactionId: 'txn_0987654321',
    invoiceId: 'INV-004',
    description: 'Payment for Pedicure service',
    metadata: {
      refundedAt: new Date(),
      refundReason: 'Customer requested',
    },
    createdAt: new Date('2024-04-01'),
    updatedAt: new Date('2024-04-10'),
  };

  // Create Payment DTO fixtures
  static readonly VALID_PAYMENT_DTO = {
    appointmentId: '607f1f77bcf86cd799439020',
    amount: 50.0,
    currency: 'USD',
    method: 'credit_card',
    description: 'Service payment',
    cardToken: 'tok_visa',
  };

  static readonly INVALID_AMOUNT_DTO = {
    appointmentId: '607f1f77bcf86cd799439020',
    amount: -50.0, // Negative amount
    currency: 'USD',
    method: 'credit_card',
    description: 'Service payment',
    cardToken: 'tok_visa',
  };

  static readonly ZERO_AMOUNT_DTO = {
    appointmentId: '607f1f77bcf86cd799439020',
    amount: 0,
    currency: 'USD',
    method: 'credit_card',
    description: 'Service payment',
    cardToken: 'tok_visa',
  };

  static readonly MISSING_APPOINTMENT_DTO = {
    // appointmentId is missing
    amount: 50.0,
    currency: 'USD',
    method: 'credit_card',
    description: 'Service payment',
    cardToken: 'tok_visa',
  };

  // Refund DTO fixtures
  static readonly VALID_REFUND_DTO = {
    reason: 'Customer requested refund',
    amount: 50.0,
  };

  static readonly INVALID_REFUND_AMOUNT_DTO = {
    reason: 'Partial refund',
    amount: 100.0, // More than original payment
  };

  /**
   * Get payment by status
   */
  static getPaymentByStatus(
    status: 'pending' | 'completed' | 'failed' | 'refunded',
  ) {
    const payments = {
      pending: this.PENDING_PAYMENT,
      completed: this.COMPLETED_PAYMENT,
      failed: this.FAILED_PAYMENT,
      refunded: this.REFUNDED_PAYMENT,
    };
    return payments[status];
  }

  /**
   * Get all test payments
   */
  static getAllPayments() {
    return [
      this.COMPLETED_PAYMENT,
      this.PENDING_PAYMENT,
      this.FAILED_PAYMENT,
      this.REFUNDED_PAYMENT,
    ];
  }

  /**
   * Create a custom payment
   */
  static createCustomPayment(
    overrides: Partial<typeof this.COMPLETED_PAYMENT> = {},
  ) {
    return {
      ...this.COMPLETED_PAYMENT,
      _id: new Types.ObjectId(),
      userId: new Types.ObjectId(),
      appointmentId: new Types.ObjectId(),
      ...overrides,
    };
  }

  /**
   * Create payment with specific amount
   */
  static createPaymentWithAmount(amount: number) {
    return this.createCustomPayment({
      amount,
      status: 'pending',
    });
  }
}
