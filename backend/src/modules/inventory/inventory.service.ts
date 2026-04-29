import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../../schemas/product.schema';
import { UpdateInventoryDto, AddStockDto } from './dto/inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async findAll(query: { lowStock?: string }) {
    const filter: any = { isActive: true };
    if (query.lowStock === 'true') {
      filter.stock = { $lte: 10 }; // Low stock threshold
    }
    return this.productModel
      .find(filter)
      .select('_id name category stock price')
      .sort({ stock: 1 });
  }

  async getByProduct(productId: string) {
    const product = await this.productModel
      .findById(productId)
      .select('_id name category stock price');
    if (!product) throw new NotFoundException('Product not found');
    return {
      productId: product._id,
      name: product.name,
      category: product.category,
      stock: product.stock,
      price: product.price,
      lowStock: product.stock <= 10,
    };
  }

  async update(productId: string, updateInventoryDto: UpdateInventoryDto) {
    const product = await this.productModel.findByIdAndUpdate(
      productId,
      { stock: updateInventoryDto.stock },
      { new: true },
    );
    if (!product) throw new NotFoundException('Product not found');
    return {
      _id: product._id,
      name: product.name,
      stock: product.stock,
      message: 'Inventory updated successfully',
    };
  }

  async addStock(addStockDto: AddStockDto) {
    const product = await this.productModel.findByIdAndUpdate(
      addStockDto.productId,
      { $inc: { stock: addStockDto.quantity } },
      { new: true },
    );
    if (!product) throw new NotFoundException('Product not found');
    return {
      _id: product._id,
      name: product.name,
      stock: product.stock,
      addedQuantity: addStockDto.quantity,
      message: 'Stock added successfully',
    };
  }
}
