import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BeautyService, ServiceDocument } from '../../schemas/service.schema';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectModel(BeautyService.name) private serviceModel: Model<ServiceDocument>,
  ) {}

  async findAll(query: {
    category?: string;
    isActive?: string;
    search?: string;
    minPrice?: string;
    maxPrice?: string;
    minDuration?: string;
    maxDuration?: string;
    sortBy?: string;
    sortOrder?: string;
  }) {
    const filter: any = {};
    
    if (query.category) filter.category = query.category;
    if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';
    
    // Search in name and description
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } },
      ];
    }
    
    // Price range filter
    if (query.minPrice || query.maxPrice) {
      filter.price = {};
      if (query.minPrice) filter.price.$gte = parseFloat(query.minPrice);
      if (query.maxPrice) filter.price.$lte = parseFloat(query.maxPrice);
    }
    
    // Duration range filter
    if (query.minDuration || query.maxDuration) {
      filter.duration = {};
      if (query.minDuration) filter.duration.$gte = parseInt(query.minDuration);
      if (query.maxDuration) filter.duration.$lte = parseInt(query.maxDuration);
    }
    
    // Sorting
    const sortOptions: any = {};
    if (query.sortBy) {
      sortOptions[query.sortBy] = query.sortOrder === 'desc' ? -1 : 1;
    } else {
      sortOptions.createdAt = -1;
    }
    
    return this.serviceModel.find(filter).sort(sortOptions);
  }

  async getCategories() {
    return this.serviceModel.distinct('category');
  }

  async findById(id: string) {
    const service = await this.serviceModel.findById(id);
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }

  async findPopular() {
    return this.serviceModel.find({ popular: true, isActive: true }).limit(6);
  }

  async create(createServiceDto: CreateServiceDto) {
    return this.serviceModel.create(createServiceDto);
  }

  async update(id: string, updateServiceDto: UpdateServiceDto) {
    const service = await this.serviceModel.findByIdAndUpdate(id, updateServiceDto, { new: true });
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }

  async remove(id: string) {
    const service = await this.serviceModel.findByIdAndDelete(id);
    if (!service) throw new NotFoundException('Service not found');
    return { message: 'Service deleted successfully' };
  }
}
