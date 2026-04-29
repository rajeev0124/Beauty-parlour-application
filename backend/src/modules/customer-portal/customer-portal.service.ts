import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Appointment } from '../../schemas/appointment.schema';
import { Order } from '../../schemas/order.schema';
import { Payment } from '../../schemas/payment.schema';
import { User } from '../../schemas/user.schema';
import { BeautyService } from '../../schemas/service.schema';
import { Product } from '../../schemas/product.schema';
import { Staff } from '../../schemas/staff.schema';

@Injectable()
export class CustomerPortalService {
  constructor(
    @InjectModel(Appointment.name) private appointmentModel: Model<Appointment>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Payment.name) private paymentModel: Model<Payment>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(BeautyService.name) private serviceModel: Model<BeautyService>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Staff.name) private staffModel: Model<Staff>,
  ) {}

  // ============ SERVICES ============
  async getServices(query: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const filter: any = { isActive: true };
    
    if (query.category) filter.category = query.category;
    if (query.minPrice || query.maxPrice) {
      filter.price = {};
      if (query.minPrice) filter.price.$gte = query.minPrice;
      if (query.maxPrice) filter.price.$lte = query.maxPrice;
    }
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } },
      ];
    }

    const sortOptions: any = {};
    if (query.sortBy) {
      sortOptions[query.sortBy] = query.sortOrder === 'desc' ? -1 : 1;
    } else {
      sortOptions.name = 1;
    }

    return this.serviceModel.find(filter).sort(sortOptions);
  }

  async getServiceById(id: string) {
    const service = await this.serviceModel.findById(id);
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }

  async getServiceCategories() {
    return this.serviceModel.distinct('category');
  }

  // ============ PRODUCTS ============
  async getProducts(query: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    inStock?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const filter: any = { isActive: true };
    
    if (query.category) filter.category = query.category;
    if (query.inStock) filter.stock = { $gt: 0 };
    if (query.minPrice || query.maxPrice) {
      filter.price = {};
      if (query.minPrice) filter.price.$gte = query.minPrice;
      if (query.maxPrice) filter.price.$lte = query.maxPrice;
    }
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } },
        { brand: { $regex: query.search, $options: 'i' } },
      ];
    }

    const sortOptions: any = {};
    if (query.sortBy) {
      sortOptions[query.sortBy] = query.sortOrder === 'desc' ? -1 : 1;
    } else {
      sortOptions.name = 1;
    }

    return this.productModel.find(filter).sort(sortOptions);
  }

  async getProductById(id: string) {
    const product = await this.productModel.findById(id);
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async getProductCategories() {
    return this.productModel.distinct('category');
  }

  // ============ STAFF ============
  async getAvailableStaff(query: {
    serviceId?: string;
    date?: string;
  }) {
    const filter: any = { isActive: true };
    
    if (query.serviceId) {
      filter.specializations = { $in: [new Types.ObjectId(query.serviceId)] };
    }

    const staff = await this.staffModel.find(filter).select('name specializations availability image');

    // If date provided, check availability
    if (query.date) {
      const date = new Date(query.date);
      const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
      
      return staff.filter(s => {
        const availability = s.availability as any;
        return availability?.[dayOfWeek]?.isAvailable !== false;
      });
    }

    return staff;
  }

  async getStaffById(id: string) {
    const staff = await this.staffModel.findById(id);
    if (!staff) throw new NotFoundException('Staff not found');
    return staff;
  }

  // ============ APPOINTMENTS ============
  async getMyAppointments(userId: string, query: {
    status?: string;
    startDate?: string;
    endDate?: string;
  }) {
    // Query with both ObjectId and string to handle legacy data
    const filter: any = {
      $or: [
        { userId: new Types.ObjectId(userId) },
        { userId: userId }
      ]
    };
    
    if (query.status) filter.status = query.status;
    if (query.startDate || query.endDate) {
      filter.date = {};
      if (query.startDate) filter.date.$gte = new Date(query.startDate);
      if (query.endDate) filter.date.$lte = new Date(query.endDate);
    }

    return this.appointmentModel
      .find(filter)
      .populate('serviceId', 'name price duration')
      .populate('staffId', 'name')
      .sort({ date: -1 });
  }

  async bookAppointment(userId: string, data: {
    serviceId: string;
    staffId?: string;  // Optional - for "Any available staff" option
    date: string;
    time: string;
    notes?: string;
  }) {
    // Validate service exists
    const service = await this.serviceModel.findById(data.serviceId);
    if (!service) throw new NotFoundException('Service not found');

    // Build appointment data
    const appointmentData: any = {
      userId: new Types.ObjectId(userId),
      userName: '', // Will be filled from user data if needed
      serviceId: new Types.ObjectId(data.serviceId),
      serviceName: service.name,
      date: data.date,
      time: data.time,
      status: 'pending',
      notes: data.notes || '',
    };

    // Validate staff if provided
    if (data.staffId) {
      const staff = await this.staffModel.findById(data.staffId);
      if (!staff) throw new NotFoundException('Staff not found');

      // Check for conflicting appointments only if staff is specified
      const existingAppointment = await this.appointmentModel.findOne({
        staffId: data.staffId,
        date: data.date,
        time: data.time,
        status: { $nin: ['cancelled'] },
      });

      if (existingAppointment) {
        throw new BadRequestException('This time slot is already booked');
      }

      appointmentData.staffId = new Types.ObjectId(data.staffId);
      appointmentData.staffName = staff.name;
    }

    // Create appointment
    const appointment = await this.appointmentModel.create(appointmentData);

    return this.appointmentModel.findById(appointment._id)
      .populate('serviceId')
      .populate('staffId');
  }

  async cancelAppointment(userId: string, appointmentId: string) {
    const appointment = await this.appointmentModel.findOne({
      _id: appointmentId,
      userId: new Types.ObjectId(userId),
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.status === 'completed') {
      throw new BadRequestException('Cannot cancel completed appointment');
    }

    if (appointment.status === 'cancelled') {
      throw new BadRequestException('Appointment already cancelled');
    }

    appointment.status = 'cancelled';
    await appointment.save();

    return { message: 'Appointment cancelled successfully', appointment };
  }

  async rescheduleAppointment(
    userId: string,
    appointmentId: string,
    newDate: string,
    newTime: string,
  ) {
    const appointment = await this.appointmentModel.findOne({
      _id: appointmentId,
      userId: new Types.ObjectId(userId),
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      throw new BadRequestException('Cannot reschedule this appointment');
    }

    // Check for conflicting appointments
    const existingAppointment = await this.appointmentModel.findOne({
      staffId: appointment.staffId,
      date: new Date(newDate),
      time: newTime,
      status: { $nin: ['cancelled'] },
      _id: { $ne: appointmentId },
    });

    if (existingAppointment) {
      throw new BadRequestException('This time slot is already booked');
    }

    appointment.date = newDate;
    appointment.time = newTime;
    await appointment.save();

    return { message: 'Appointment rescheduled successfully', appointment };
  }

  // ============ ORDERS ============
  async getMyOrders(userId: string, query: {
    status?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const filter: any = { userId: new Types.ObjectId(userId) };
    
    if (query.status) filter.status = query.status;
    if (query.startDate || query.endDate) {
      filter.createdAt = {};
      if (query.startDate) filter.createdAt.$gte = new Date(query.startDate);
      if (query.endDate) filter.createdAt.$lte = new Date(query.endDate);
    }

    return this.orderModel.find(filter).sort({ createdAt: -1 });
  }

  async createOrder(userId: string, data: {
    items: { productId: string; quantity: number }[];
    shippingAddress?: string;
    notes?: string;
  }) {
    // Validate products and calculate total
    let totalPrice = 0;
    const orderItems: any[] = [];

    for (const item of data.items) {
      const product = await this.productModel.findById(item.productId);
      if (!product) {
        throw new NotFoundException(`Product ${item.productId} not found`);
      }
      if (product.stock < item.quantity) {
        throw new BadRequestException(`Insufficient stock for ${product.name}`);
      }

      orderItems.push({
        productId: new Types.ObjectId(item.productId),
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
      });

      totalPrice += product.price * item.quantity;

      // Reduce stock
      product.stock -= item.quantity;
      await product.save();
    }

    const order = await this.orderModel.create({
      userId: new Types.ObjectId(userId),
      items: orderItems,
      totalPrice,
      status: 'pending',
    });

    return order;
  }

  async cancelOrder(userId: string, orderId: string) {
    const order = await this.orderModel.findOne({
      _id: orderId,
      userId: new Types.ObjectId(userId),
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status === 'delivered') {
      throw new BadRequestException('Cannot cancel delivered order');
    }

    if (order.status === 'cancelled') {
      throw new BadRequestException('Order already cancelled');
    }

    // Restore stock
    for (const item of order.items) {
      await this.productModel.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity },
      });
    }

    order.status = 'cancelled';
    await order.save();

    return { message: 'Order cancelled successfully', order };
  }

  // ============ PAYMENTS ============
  async getMyPayments(userId: string) {
    // Get orders for this user first, then get payments for those orders
    const orders = await this.orderModel.find({ userId: new Types.ObjectId(userId) });
    const orderIds = orders.map(o => o._id);
    return this.paymentModel
      .find({ orderId: { $in: orderIds } })
      .sort({ createdAt: -1 });
  }

  // ============ DASHBOARD ============
  async getMyDashboard(userId: string) {
    const today = new Date().toISOString().split('T')[0];
    const [
      upcomingAppointments,
      pendingOrders,
      totalSpent,
      appointmentCount,
      orderCount,
    ] = await Promise.all([
      this.appointmentModel
        .find({
          userId: new Types.ObjectId(userId),
          date: { $gte: today },
          status: { $in: ['pending', 'confirmed'] },
        })
        .populate('serviceId', 'name')
        .populate('staffId', 'name')
        .sort({ date: 1 })
        .limit(5),
      this.orderModel
        .find({
          userId: new Types.ObjectId(userId),
          status: { $in: ['pending', 'processing'] },
        })
        .sort({ createdAt: -1 })
        .limit(5),
      // Get total spent - need to get via orders first
      (async () => {
        const userOrders = await this.orderModel.find({ userId: new Types.ObjectId(userId) });
        const orderIds = userOrders.map(o => o._id);
        const result = await this.paymentModel.aggregate([
          { $match: { orderId: { $in: orderIds }, status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);
        return result;
      })(),
      this.appointmentModel.countDocuments({ userId: new Types.ObjectId(userId) }),
      this.orderModel.countDocuments({ userId: new Types.ObjectId(userId) }),
    ]);

    return {
      upcomingAppointments,
      pendingOrders,
      totalSpent: totalSpent[0]?.total || 0,
      appointmentCount,
      orderCount,
    };
  }

  // ============ PROFILE ============
  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId).select('-password -refreshToken');
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: string, data: {
    name?: string;
    phone?: string;
    address?: string;
    profileImage?: string;
  }) {
    const user = await this.userModel
      .findByIdAndUpdate(userId, data, { new: true })
      .select('-password -refreshToken');
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // ============ AVAILABLE SLOTS ============
  async getAvailableSlots(staffId: string, date: string) {
    const staff = await this.staffModel.findById(staffId);
    if (!staff) throw new NotFoundException('Staff not found');

    const dateObj = new Date(date);
    const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dateObj.getDay()];
    
    const availability = staff.availability as any;
    if (!availability?.[dayOfWeek]?.isAvailable) {
      return { available: false, slots: [], message: 'Staff not available on this day' };
    }

    // Get booked slots for this date
    const bookedAppointments = await this.appointmentModel.find({
      staffId,
      date: dateObj,
      status: { $nin: ['cancelled'] },
    });

    const bookedTimes = bookedAppointments.map(a => a.time);

    // Generate available time slots (9 AM to 7 PM, hourly)
    const allSlots = [
      '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
      '15:00', '16:00', '17:00', '18:00', '19:00'
    ];

    const availableSlots = allSlots.filter(slot => !bookedTimes.includes(slot));

    return {
      available: true,
      slots: availableSlots,
      bookedSlots: bookedTimes,
    };
  }
}
