import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CustomerPortalService } from './customer-portal.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators';

@Controller('customer')
export class CustomerPortalController {
  constructor(private readonly customerPortalService: CustomerPortalService) {}

  // ============ PUBLIC ROUTES ============
  @Get('services')
  getServices(
    @Query('category') category?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.customerPortalService.getServices({
      category,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      search,
      sortBy,
      sortOrder,
    });
  }

  @Get('services/categories')
  getServiceCategories() {
    return this.customerPortalService.getServiceCategories();
  }

  @Get('services/:id')
  getServiceById(@Param('id') id: string) {
    return this.customerPortalService.getServiceById(id);
  }

  @Get('products')
  getProducts(
    @Query('category') category?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('search') search?: string,
    @Query('inStock') inStock?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.customerPortalService.getProducts({
      category,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      search,
      inStock: inStock === 'true',
      sortBy,
      sortOrder,
    });
  }

  @Get('products/categories')
  getProductCategories() {
    return this.customerPortalService.getProductCategories();
  }

  @Get('products/:id')
  getProductById(@Param('id') id: string) {
    return this.customerPortalService.getProductById(id);
  }

  @Get('staff')
  getAvailableStaff(
    @Query('serviceId') serviceId?: string,
    @Query('date') date?: string,
  ) {
    return this.customerPortalService.getAvailableStaff({ serviceId, date });
  }

  @Get('staff/:id')
  getStaffById(@Param('id') id: string) {
    return this.customerPortalService.getStaffById(id);
  }

  @Get('slots/:staffId/:date')
  getAvailableSlots(
    @Param('staffId') staffId: string,
    @Param('date') date: string,
  ) {
    return this.customerPortalService.getAvailableSlots(staffId, date);
  }

  // ============ PROTECTED ROUTES (Logged in customers) ============
  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  getMyDashboard(@CurrentUser() user: any) {
    return this.customerPortalService.getMyDashboard(user._id.toString());
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: any) {
    return this.customerPortalService.getProfile(user._id.toString());
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  updateProfile(
    @CurrentUser() user: any,
    @Body() data: { name?: string; phone?: string; address?: string; profileImage?: string },
  ) {
    return this.customerPortalService.updateProfile(user._id.toString(), data);
  }

  @Get('appointments')
  @UseGuards(JwtAuthGuard)
  getMyAppointments(
    @CurrentUser() user: any,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.customerPortalService.getMyAppointments(user._id.toString(), {
      status,
      startDate,
      endDate,
    });
  }

  @Post('appointments')
  @UseGuards(JwtAuthGuard)
  bookAppointment(
    @CurrentUser() user: any,
    @Body() data: {
      serviceId: string;
      staffId?: string;  // Optional - customer can select "Any available staff"
      date: string;
      time: string;
      notes?: string;
    },
  ) {
    return this.customerPortalService.bookAppointment(user._id.toString(), data);
  }

  @Put('appointments/:id/cancel')
  @UseGuards(JwtAuthGuard)
  cancelAppointment(@CurrentUser() user: any, @Param('id') id: string) {
    return this.customerPortalService.cancelAppointment(user._id.toString(), id);
  }

  @Put('appointments/:id/reschedule')
  @UseGuards(JwtAuthGuard)
  rescheduleAppointment(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() data: { date: string; time: string },
  ) {
    return this.customerPortalService.rescheduleAppointment(
      user._id.toString(),
      id,
      data.date,
      data.time,
    );
  }

  @Get('orders')
  @UseGuards(JwtAuthGuard)
  getMyOrders(
    @CurrentUser() user: any,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.customerPortalService.getMyOrders(user._id.toString(), {
      status,
      startDate,
      endDate,
    });
  }

  @Post('orders')
  @UseGuards(JwtAuthGuard)
  createOrder(
    @CurrentUser() user: any,
    @Body() data: {
      items: { productId: string; quantity: number }[];
      shippingAddress?: string;
      notes?: string;
    },
  ) {
    return this.customerPortalService.createOrder(user._id.toString(), data);
  }

  @Put('orders/:id/cancel')
  @UseGuards(JwtAuthGuard)
  cancelOrder(@CurrentUser() user: any, @Param('id') id: string) {
    return this.customerPortalService.cancelOrder(user._id.toString(), id);
  }

  @Get('payments')
  @UseGuards(JwtAuthGuard)
  getMyPayments(@CurrentUser() user: any) {
    return this.customerPortalService.getMyPayments(user._id.toString());
  }
}
