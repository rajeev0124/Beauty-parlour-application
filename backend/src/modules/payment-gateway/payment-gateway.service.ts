import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Payment } from '../../schemas/payment.schema';
import { Order } from '../../schemas/order.schema';
import { Appointment } from '../../schemas/appointment.schema';
import * as crypto from 'crypto';

// Razorpay types
export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
}

@Injectable()
export class PaymentGatewayService {
  private razorpay: any;
  private readonly logger = new Logger(PaymentGatewayService.name);

  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<Payment>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Appointment.name) private appointmentModel: Model<Appointment>,
    private configService: ConfigService,
  ) {
    // Initialize Razorpay
    const Razorpay = require('razorpay');
    const keyId = this.configService.get('RAZORPAY_KEY_ID');
    const keySecret = this.configService.get('RAZORPAY_KEY_SECRET');

    if (keyId && keySecret) {
      this.razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
      this.logger.log('Razorpay initialized successfully');
    } else {
      this.logger.warn(
        'Razorpay credentials not configured - running in simulation mode',
      );
    }
  }

  async createOrder(
    amount: number,
    currency: string = 'INR',
    receipt: string,
    notes?: Record<string, string>,
  ): Promise<
    | RazorpayOrder
    | { simulated: true; id: string; amount: number; currency: string }
  > {
    if (!this.razorpay) {
      // Simulation mode
      const simulatedOrderId = `order_sim_${Date.now()}`;
      this.logger.log(
        `[SIMULATION] Created order: ${simulatedOrderId} for ₹${amount / 100}`,
      );
      return {
        simulated: true,
        id: simulatedOrderId,
        amount,
        currency,
      };
    }

    try {
      const order = await this.razorpay.orders.create({
        amount: amount * 100, // Razorpay expects amount in paise
        currency,
        receipt,
        notes,
      });
      this.logger.log(`Created Razorpay order: ${order.id}`);
      return order;
    } catch (error) {
      this.logger.error(`Failed to create Razorpay order: ${error.message}`);
      throw new BadRequestException('Failed to create payment order');
    }
  }

  verifyPayment(
    orderId: string,
    paymentId: string,
    signature: string,
  ): boolean {
    if (!this.razorpay) {
      // Simulation mode - always verify
      this.logger.log(`[SIMULATION] Verified payment: ${paymentId}`);
      return true;
    }

    const keySecret = this.configService.get('RAZORPAY_KEY_SECRET');
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body)
      .digest('hex');

    const isValid = expectedSignature === signature;
    this.logger.log(`Payment verification: ${isValid ? 'SUCCESS' : 'FAILED'}`);
    return isValid;
  }

  async processPaymentForOrder(
    userId: string,
    orderId: string,
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
  ) {
    // Verify payment signature
    const isValid = this.verifyPayment(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    );
    if (!isValid) {
      throw new BadRequestException('Payment verification failed');
    }

    // Get order details
    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new BadRequestException('Order not found');
    }

    // Create payment record
    const payment = await this.paymentModel.create({
      orderId,
      amount: order.totalPrice,
      method: 'online',
      transactionId: razorpayPaymentId,
      status: 'completed',
    });

    // Update order status
    await this.orderModel.findByIdAndUpdate(orderId, { status: 'processing' });

    return {
      success: true,
      payment,
      message: 'Payment processed successfully',
    };
  }

  async processPaymentForAppointment(
    userId: string,
    appointmentId: string,
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
  ) {
    // Verify payment signature
    const isValid = this.verifyPayment(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    );
    if (!isValid) {
      throw new BadRequestException('Payment verification failed');
    }

    // Get appointment details
    const appointment = await this.appointmentModel
      .findById(appointmentId)
      .populate('serviceId');
    if (!appointment) {
      throw new BadRequestException('Appointment not found');
    }

    // Get price from service
    const service = appointment.serviceId as any;
    const amount = service?.price || 0;

    // For appointments, we need an associated order or create one
    // For now, we'll skip the payment record creation for appointments
    // as the payment schema requires orderId

    // Update appointment status
    await this.appointmentModel.findByIdAndUpdate(appointmentId, {
      status: 'confirmed',
    });

    return {
      success: true,
      appointmentId,
      amount,
      transactionId: razorpayPaymentId,
      message: 'Payment processed successfully',
    };
  }

  async initiateRefund(paymentId: string, amount?: number) {
    const payment = await this.paymentModel.findById(paymentId);
    if (!payment) {
      throw new BadRequestException('Payment not found');
    }

    if (!this.razorpay) {
      // Simulation mode
      const refundId = `refund_sim_${Date.now()}`;
      this.logger.log(
        `[SIMULATION] Initiated refund: ${refundId} for ₹${amount || payment.amount}`,
      );

      await this.paymentModel.findByIdAndUpdate(paymentId, {
        status: 'refunded',
        refundId,
        refundedAt: new Date(),
      });

      return {
        success: true,
        refundId,
        amount: amount || payment.amount,
        message: 'Refund processed successfully (simulation)',
      };
    }

    try {
      const refund = await this.razorpay.payments.refund(
        payment.transactionId,
        {
          amount: (amount || payment.amount) * 100,
          speed: 'normal',
        },
      );

      await this.paymentModel.findByIdAndUpdate(paymentId, {
        status: 'refunded',
        refundId: refund.id,
        refundedAt: new Date(),
      });

      return {
        success: true,
        refundId: refund.id,
        amount: amount || payment.amount,
        message: 'Refund processed successfully',
      };
    } catch (error) {
      this.logger.error(`Refund failed: ${error.message}`);
      throw new BadRequestException('Refund failed: ' + error.message);
    }
  }

  async getPaymentStatus(razorpayPaymentId: string) {
    if (!this.razorpay) {
      return {
        id: razorpayPaymentId,
        status: 'captured',
        simulated: true,
      };
    }

    try {
      const payment = await this.razorpay.payments.fetch(razorpayPaymentId);
      return payment;
    } catch {
      throw new BadRequestException('Failed to fetch payment status');
    }
  }
}
