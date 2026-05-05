import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'superadmin')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  getDashboardStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getDashboardStats(startDate, endDate);
  }

  @Get('appointments')
  getAppointmentReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportsService.getAppointmentReport(startDate, endDate);
  }

  @Get('sales')
  getSalesReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportsService.getSalesReport(startDate, endDate);
  }

  @Get('customers')
  getCustomerReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getCustomerReport(startDate, endDate);
  }

  @Get('export/appointments/excel')
  async exportAppointmentsExcel(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response,
  ) {
    const data = await this.reportsService.getAppointmentReport(
      startDate,
      endDate,
    );
    const buffer = await this.reportsService.generateExcel(
      'Appointments',
      data.map((d) => d.toObject()),
    );

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=appointments-${Date.now()}.xlsx`,
    );
    res.send(buffer);
  }

  @Get('export/appointments/pdf')
  async exportAppointmentsPdf(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response,
  ) {
    const data = await this.reportsService.getAppointmentReport(
      startDate,
      endDate,
    );
    const buffer = await this.reportsService.generatePdf(
      'Appointments',
      data.map((d) => d.toObject()),
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=appointments-${Date.now()}.pdf`,
    );
    res.send(buffer);
  }

  @Get('export/sales/excel')
  async exportSalesExcel(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response,
  ) {
    const data = await this.reportsService.getSalesReport(startDate, endDate);
    const buffer = await this.reportsService.generateExcel(
      'Sales',
      data.orders.map((d) => d.toObject()),
    );

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=sales-${Date.now()}.xlsx`,
    );
    res.send(buffer);
  }

  @Get('export/sales/pdf')
  async exportSalesPdf(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response,
  ) {
    const data = await this.reportsService.getSalesReport(startDate, endDate);
    const buffer = await this.reportsService.generatePdf(
      'Sales',
      data.orders.map((d) => d.toObject()),
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=sales-${Date.now()}.pdf`,
    );
    res.send(buffer);
  }

  @Get('export/customers/excel')
  async exportCustomersExcel(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response,
  ) {
    const data = await this.reportsService.getCustomerReport(
      startDate,
      endDate,
    );
    const buffer = await this.reportsService.generateExcel('Customers', data);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=customers-${Date.now()}.xlsx`,
    );
    res.send(buffer);
  }

  @Get('export/customers/pdf')
  async exportCustomersPdf(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response,
  ) {
    const data = await this.reportsService.getCustomerReport(
      startDate,
      endDate,
    );
    const buffer = await this.reportsService.generatePdf('Customers', data);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=customers-${Date.now()}.pdf`,
    );
    res.send(buffer);
  }
}
