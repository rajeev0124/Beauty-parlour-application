import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from '../../schemas/order.schema';
import { Product, ProductDocument } from '../../schemas/product.schema';
import { CreateOrderDto, UpdateOrderDto } from './dto/order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async findAll(query: { status?: string; userId?: string }) {
    const filter: any = {};
    if (query.status) filter.status = query.status;
    if (query.userId) filter.userId = query.userId;
    return this.orderModel.find(filter).sort({ createdAt: -1 });
  }

  async findById(id: string) {
    const order = await this.orderModel.findById(id);
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async create(createOrderDto: CreateOrderDto) {
    // Validate stock availability and deduct stock
    for (const item of createOrderDto.items) {
      const product = await this.productModel.findById(item.productId);
      if (!product) {
        throw new BadRequestException(`Product ${item.productId} not found`);
      }
      if (product.stock < item.quantity) {
        throw new BadRequestException(`Insufficient stock for ${product.name}`);
      }
      // Deduct stock
      await this.productModel.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }

    // Transform DTO to match schema (convert string IDs to ObjectId)
    const orderData = {
      userId: new Types.ObjectId(createOrderDto.userId),
      userName: createOrderDto.userName,
      items: createOrderDto.items.map(item => ({
        productId: new Types.ObjectId(item.productId),
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
      })),
      totalPrice: createOrderDto.totalPrice,
    };

    return this.orderModel.create(orderData);
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const order = await this.orderModel.findByIdAndUpdate(id, updateOrderDto, { new: true });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async remove(id: string) {
    const order = await this.orderModel.findById(id);
    if (!order) throw new NotFoundException('Order not found');

    // Restore stock if order is being deleted
    if (order.status !== 'cancelled') {
      for (const item of order.items) {
        await this.productModel.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity },
        });
      }
    }

    await this.orderModel.findByIdAndDelete(id);
    return { message: 'Order deleted successfully' };
  }
}
