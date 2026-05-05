import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentDocument } from '../../schemas/payment.schema';
import { Order, OrderDocument } from '../../schemas/order.schema';
import { CreatePaymentDto, UpdatePaymentDto } from './dto/payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async findAll(query: { status?: string; method?: string }) {
    const filter: any = {};
    if (query.status) filter.status = query.status;
    if (query.method) filter.method = query.method;
    return this.paymentModel.find(filter).sort({ createdAt: -1 });
  }

  async findById(id: string) {
    const payment = await this.paymentModel.findById(id);
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async create(createPaymentDto: CreatePaymentDto) {
    // Verify order exists
    const order = await this.orderModel.findById(createPaymentDto.orderId);
    if (!order) throw new BadRequestException('Order not found');

    // Check for existing payment
    const existingPayment = await this.paymentModel.findOne({
      orderId: createPaymentDto.orderId,
      status: 'completed',
    });
    if (existingPayment) {
      throw new BadRequestException('Payment already completed for this order');
    }

    const payment = await this.paymentModel.create(createPaymentDto);

    // Update order status if payment completed
    if (createPaymentDto.method === 'cash') {
      await this.paymentModel.findByIdAndUpdate(payment._id, {
        status: 'completed',
      });
      await this.orderModel.findByIdAndUpdate(createPaymentDto.orderId, {
        status: 'processing',
      });
    }

    return payment;
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto) {
    const payment = await this.paymentModel.findByIdAndUpdate(
      id,
      updatePaymentDto,
      { new: true },
    );
    if (!payment) throw new NotFoundException('Payment not found');

    // Update order status when payment is completed
    if (updatePaymentDto.status === 'completed') {
      await this.orderModel.findByIdAndUpdate(payment.orderId, {
        status: 'processing',
      });
    }

    return payment;
  }

  async remove(id: string) {
    const payment = await this.paymentModel.findByIdAndDelete(id);
    if (!payment) throw new NotFoundException('Payment not found');
    return { message: 'Payment deleted successfully' };
  }
}
