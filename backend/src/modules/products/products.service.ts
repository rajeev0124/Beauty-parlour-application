import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../../schemas/product.schema';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async findAll(query: {
    category?: string;
    isActive?: string;
    bestseller?: string;
    search?: string;
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
    brand?: string;
    sortBy?: string;
    sortOrder?: string;
  }) {
    const filter: any = {};

    if (query.category) filter.category = query.category;
    if (query.isActive !== undefined)
      filter.isActive = query.isActive === 'true';
    if (query.bestseller !== undefined)
      filter.bestseller = query.bestseller === 'true';
    if (query.brand) filter.brand = { $regex: query.brand, $options: 'i' };
    if (query.inStock === 'true') filter.stock = { $gt: 0 };

    // Search in name, description, and brand
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } },
        { brand: { $regex: query.search, $options: 'i' } },
      ];
    }

    // Price range filter
    if (query.minPrice || query.maxPrice) {
      filter.price = {};
      if (query.minPrice) filter.price.$gte = parseFloat(query.minPrice);
      if (query.maxPrice) filter.price.$lte = parseFloat(query.maxPrice);
    }

    // Sorting
    const sortOptions: any = {};
    if (query.sortBy) {
      sortOptions[query.sortBy] = query.sortOrder === 'desc' ? -1 : 1;
    } else {
      sortOptions.createdAt = -1;
    }

    return this.productModel.find(filter).sort(sortOptions);
  }

  async getCategories() {
    return this.productModel.distinct('category');
  }

  async getBrands() {
    return this.productModel.distinct('brand');
  }

  async findById(id: string) {
    const product = await this.productModel.findById(id);
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(createProductDto: CreateProductDto) {
    return this.productModel.create(createProductDto);
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.productModel.findByIdAndUpdate(
      id,
      updateProductDto,
      { new: true },
    );
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async remove(id: string) {
    const product = await this.productModel.findByIdAndDelete(id);
    if (!product) throw new NotFoundException('Product not found');
    return { message: 'Product deleted successfully' };
  }

  async updateStock(id: string, quantity: number) {
    const product = await this.productModel.findByIdAndUpdate(
      id,
      { $inc: { stock: quantity } },
      { new: true },
    );
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }
}
