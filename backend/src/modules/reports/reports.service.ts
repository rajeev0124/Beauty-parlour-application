import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Appointment } from '../../schemas/appointment.schema';
import { Order } from '../../schemas/order.schema';
import { Payment } from '../../schemas/payment.schema';
import { User } from '../../schemas/user.schema';
import { BeautyService } from '../../schemas/service.schema';
import { Product } from '../../schemas/product.schema';
import * as ExcelJS from 'exceljs';
import * as PDFDocument from 'pdfkit';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    @InjectModel(Appointment.name) private appointmentModel: Model<Appointment>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Payment.name) private paymentModel: Model<Payment>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(BeautyService.name) private serviceModel: Model<BeautyService>,
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  async getDashboardStats(startDate?: string, endDate?: string) {
    // Simplified query - only use date filter if dates are provided
    const dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Run simpler queries in parallel for speed
    const [
      totalCustomers,
      totalAppointments,
      totalOrders,
      totalRevenue,
      appointmentsByStatus,
      recentAppointments,
    ] = await Promise.all([
      // Simple count queries (fast)
      this.userModel.countDocuments({ role: 'customer' }).exec(),
      this.appointmentModel.countDocuments(dateFilter).exec(),
      this.orderModel.countDocuments(dateFilter).exec(),
      
      // Revenue sum (simplified)
      this.paymentModel.aggregate([
        { $match: { status: 'completed', ...dateFilter } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]).exec(),
      
      // Appointments by status (simplified)
      this.appointmentModel.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]).exec(),
      
      // Recent appointments (fast - limited to 5)
      this.appointmentModel
        .find(dateFilter)
        .sort({ createdAt: -1 })
        .limit(5)
        .select('userName serviceName staffName time status createdAt')
        .lean()
        .exec(),
    ]);

    // Run slower queries separately with fallback to empty arrays
    let topServices: any[] = [];
    let topProducts: any[] = [];
    let revenueByMonth: any[] = [];

    try {
      // Top services - simplified without $lookup
      const serviceStats = await this.appointmentModel.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$serviceName', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $project: { name: '$_id', count: 1, _id: 0 } },
      ]).exec();
      topServices = serviceStats;
    } catch (e) {
      this.logger.error('Error fetching top services:', e);
    }

    try {
      // Revenue by month - simplified
      revenueByMonth = await this.paymentModel.aggregate([
        { $match: { status: 'completed', ...dateFilter } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            revenue: { $sum: '$amount' },
          },
        },
        { $sort: { _id: 1 } },
        { $limit: 12 },
      ]).exec();
    } catch (e) {
      this.logger.error('Error fetching revenue by month:', e);
    }

    return {
      totalCustomers,
      totalAppointments,
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      appointmentsByStatus,
      revenueByMonth,
      topServices,
      topProducts,
      recentAppointments: recentAppointments || [],
    };
  }

  async getAppointmentReport(startDate: string, endDate: string) {
    return this.appointmentModel
      .find({
        date: { $gte: startDate, $lte: endDate },
      })
      .populate('userId', 'name email phone')
      .populate('serviceId', 'name price')
      .populate('staffId', 'name')
      .sort({ date: -1 });
  }

  async getSalesReport(startDate: string, endDate: string) {
    const orders = await this.orderModel
      .find({
        createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
      })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    const payments = await this.paymentModel
      .find({
        createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
      })
      .populate('orderId')
      .sort({ createdAt: -1 });

    const totalSales = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0);

    return {
      orders,
      payments,
      totalSales,
      totalPayments,
      orderCount: orders.length,
      paymentCount: payments.length,
    };
  }

  async getCustomerReport(startDate?: string, endDate?: string) {
    const dateFilter: any = { role: 'customer' };
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    const customers = await this.userModel.find(dateFilter).select('-password -refreshToken');

    // Get customer statistics
    const customerStats = await Promise.all(
      customers.map(async (customer) => {
        const [appointmentCount, orderCount, totalSpent] = await Promise.all([
          this.appointmentModel.countDocuments({ userId: customer._id }),
          this.orderModel.countDocuments({ userId: customer._id }),
          this.paymentModel.aggregate([
            { $match: { userId: customer._id, status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
          ]),
        ]);

        return {
          ...customer.toObject(),
          appointmentCount,
          orderCount,
          totalSpent: totalSpent[0]?.total || 0,
        };
      }),
    );

    return customerStats;
  }

  async generateExcel(reportType: string, data: any[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(reportType);

    if (data.length === 0) {
      worksheet.addRow(['No data available']);
      const buffer = await workbook.xlsx.writeBuffer();
      return Buffer.from(buffer);
    }

    // Add headers
    const headers = Object.keys(data[0]).filter((key) => !key.startsWith('_'));
    worksheet.addRow(headers);

    // Style headers
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE91E63' },
    };

    // Add data rows
    data.forEach((item) => {
      const row = headers.map((header) => {
        const value = item[header];
        if (value instanceof Date) return value.toISOString();
        if (typeof value === 'object') return JSON.stringify(value);
        return value;
      });
      worksheet.addRow(row);
    });

    // Auto-fit columns
    worksheet.columns.forEach((column) => {
      column.width = 20;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async generatePdf(reportType: string, data: any[]): Promise<Buffer> {
    return new Promise((resolve) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Header
      doc.fontSize(24).fillColor('#e91e63').text('Beauty Parlour', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(16).fillColor('#333').text(`${reportType} Report`, { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(10).fillColor('#666').text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
      doc.moveDown();

      // Line separator
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#e91e63');
      doc.moveDown();

      if (data.length === 0) {
        doc.fontSize(12).fillColor('#333').text('No data available for this report.');
      } else {
        // Data content
        const headers = Object.keys(data[0]).filter((key) => !key.startsWith('_') && key !== 'password');
        
        // Table header
        doc.fontSize(10).fillColor('#e91e63');
        let y = doc.y;
        let x = 50;
        headers.slice(0, 5).forEach((header, i) => {
          doc.text(header.toUpperCase(), x + (i * 100), y, { width: 95 });
        });
        doc.moveDown();

        // Table rows
        doc.fillColor('#333');
        data.slice(0, 20).forEach((item) => {
          y = doc.y;
          x = 50;
          headers.slice(0, 5).forEach((header, i) => {
            let value = item[header];
            if (value instanceof Date) value = value.toLocaleDateString();
            if (typeof value === 'object') value = '-';
            doc.text(String(value || '-').substring(0, 15), x + (i * 100), y, { width: 95 });
          });
          doc.moveDown(0.5);

          // Add new page if needed
          if (doc.y > 700) {
            doc.addPage();
          }
        });

        if (data.length > 20) {
          doc.moveDown();
          doc.fontSize(10).fillColor('#666').text(`... and ${data.length - 20} more records`);
        }
      }

      // Footer
      doc.moveDown(2);
      doc.fontSize(8).fillColor('#999').text('© 2024 Beauty Parlour - Confidential Report', { align: 'center' });

      doc.end();
    });
  }
}
