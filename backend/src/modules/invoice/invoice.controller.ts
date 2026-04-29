import { Controller, Get, Param, Res, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { InvoiceService, InvoiceData } from './invoice.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Controller('invoice')
export class InvoiceController {
  constructor(
    private readonly invoiceService: InvoiceService,
    @InjectModel('Payment') private paymentModel: Model<any>,
    @InjectModel('Appointment') private appointmentModel: Model<any>,
    @InjectModel('Order') private orderModel: Model<any>,
  ) {}

  @Get('appointment/:id')
  @UseGuards(JwtAuthGuard)
  async generateAppointmentInvoice(@Param('id') id: string, @Res() res: Response) {
    try {
      const appointment = await this.appointmentModel
        .findById(id)
        .populate('userId', 'name email phone address')
        .populate('serviceId', 'name description price')
        .populate('staffId', 'name')
        .exec();

      if (!appointment) {
        throw new HttpException('Appointment not found', HttpStatus.NOT_FOUND);
      }

      const user = appointment.userId as any;
      const service = appointment.serviceId as any;
      const staff = appointment.staffId as any;

      const invoiceData: InvoiceData = {
        invoiceNumber: this.invoiceService.generateInvoiceNumber(),
        date: new Date(appointment.date),
        customerName: user?.name || appointment.userName || 'Customer',
        customerEmail: user?.email || '',
        customerPhone: user?.phone,
        customerAddress: user?.address,
        items: [{
          name: service?.name || appointment.serviceName || 'Service',
          description: service?.description || '',
          quantity: 1,
          unitPrice: (appointment as any).totalAmount || service?.price || 0,
          total: (appointment as any).totalAmount || service?.price || 0,
        }],
        subtotal: (appointment as any).totalAmount || 0,
        discount: (appointment as any).discount || 0,
        total: ((appointment as any).totalAmount || 0) - ((appointment as any).discount || 0),
        paymentMethod: (appointment as any).paymentMethod || 'Cash',
        paymentStatus: (appointment as any).paymentStatus || 'pending',
        notes: `Appointment Time: ${appointment.time}\nStaff: ${staff?.name || appointment.staffName || 'Any available'}`,
      };

      const pdfBuffer = await this.invoiceService.generateInvoicePDF(invoiceData);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoiceData.invoiceNumber}.pdf"`,
        'Content-Length': pdfBuffer.length,
      });

      res.send(pdfBuffer);
    } catch (error) {
      throw new HttpException(error.message || 'Failed to generate invoice', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('order/:id')
  @UseGuards(JwtAuthGuard)
  async generateOrderInvoice(@Param('id') id: string, @Res() res: Response) {
    try {
      const order = await this.orderModel
        .findById(id)
        .populate('userId', 'name email phone address')
        .populate('items.productId', 'name description price')
        .exec();

      if (!order) {
        throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
      }

      const user = order.userId as any;

      const items = (order.items || []).map((item: any) => {
        const product = item.productId as any;
        return {
          name: product?.name || item.productName || 'Product',
          description: product?.description || '',
          quantity: item.quantity || 1,
          unitPrice: item.price || product?.price || 0,
          total: (item.quantity || 1) * (item.price || product?.price || 0),
        };
      });

      const invoiceData: InvoiceData = {
        invoiceNumber: this.invoiceService.generateInvoiceNumber(),
        date: (order as any).createdAt || new Date(),
        customerName: user?.name || (order as any).userName || 'Customer',
        customerEmail: user?.email || '',
        customerPhone: user?.phone,
        customerAddress: (order as any).shippingAddress || user?.address,
        items,
        subtotal: (order as any).subtotal || order.totalPrice || 0,
        discount: (order as any).discount || 0,
        tax: (order as any).tax || 0,
        total: order.totalPrice || 0,
        paymentMethod: (order as any).paymentMethod || 'Cash',
        paymentStatus: (order as any).paymentStatus || order.status || 'pending',
        notes: (order as any).notes || '',
      };

      const pdfBuffer = await this.invoiceService.generateInvoicePDF(invoiceData);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoiceData.invoiceNumber}.pdf"`,
        'Content-Length': pdfBuffer.length,
      });

      res.send(pdfBuffer);
    } catch (error) {
      throw new HttpException(error.message || 'Failed to generate invoice', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('payment/:id')
  @UseGuards(JwtAuthGuard)
  async generatePaymentReceipt(@Param('id') id: string, @Res() res: Response) {
    try {
      const payment = await this.paymentModel
        .findById(id)
        .populate({
          path: 'orderId',
          populate: { path: 'userId', select: 'name email phone address' }
        })
        .exec();

      if (!payment) {
        throw new HttpException('Payment not found', HttpStatus.NOT_FOUND);
      }

      const order = payment.orderId as any;
      const user = order?.userId as any;

      const invoiceData: InvoiceData = {
        invoiceNumber: payment.transactionId || this.invoiceService.generateInvoiceNumber(),
        date: (payment as any).createdAt || new Date(),
        customerName: user?.name || 'Customer',
        customerEmail: user?.email || '',
        customerPhone: user?.phone,
        items: [{
          name: 'Payment',
          description: order ? 'Order Payment' : 'Service Payment',
          quantity: 1,
          unitPrice: payment.amount || 0,
          total: payment.amount || 0,
        }],
        subtotal: payment.amount || 0,
        total: payment.amount || 0,
        paymentMethod: payment.method || 'Cash',
        paymentStatus: payment.status || 'completed',
      };

      const pdfBuffer = await this.invoiceService.generateInvoicePDF(invoiceData);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="receipt-${invoiceData.invoiceNumber}.pdf"`,
        'Content-Length': pdfBuffer.length,
      });

      res.send(pdfBuffer);
    } catch (error) {
      throw new HttpException(error.message || 'Failed to generate receipt', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
