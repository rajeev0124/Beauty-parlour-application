import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ServicePackage,
  ServicePackageDocument,
} from './schemas/service-package.schema';
import { CreatePackageDto, UpdatePackageDto } from './dto/package.dto';

@Injectable()
export class PackagesService {
  constructor(
    @InjectModel(ServicePackage.name)
    private packageModel: Model<ServicePackageDocument>,
  ) {}

  async create(createPackageDto: CreatePackageDto): Promise<ServicePackage> {
    // Calculate discount percentage if not provided
    if (
      !createPackageDto.discountPercentage &&
      createPackageDto.originalPrice > 0
    ) {
      createPackageDto.discountPercentage = Math.round(
        ((createPackageDto.originalPrice - createPackageDto.packagePrice) /
          createPackageDto.originalPrice) *
          100,
      );
    }

    const newPackage = new this.packageModel(createPackageDto);
    return newPackage.save();
  }

  async findAll(query?: {
    isActive?: boolean;
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<ServicePackage[]> {
    const filter: any = {};

    if (query?.isActive !== undefined) {
      filter.isActive = query.isActive;
    }

    if (query?.category) {
      filter.category = query.category;
    }

    if (query?.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } },
        { tags: { $in: [new RegExp(query.search, 'i')] } },
      ];
    }

    if (query?.minPrice !== undefined || query?.maxPrice !== undefined) {
      filter.packagePrice = {};
      if (query.minPrice !== undefined) {
        filter.packagePrice.$gte = query.minPrice;
      }
      if (query.maxPrice !== undefined) {
        filter.packagePrice.$lte = query.maxPrice;
      }
    }

    return this.packageModel
      .find(filter)
      .populate('services.service')
      .sort({ sortOrder: 1, createdAt: -1 })
      .exec();
  }

  async findActive(): Promise<ServicePackage[]> {
    const now = new Date();
    return this.packageModel
      .find({
        isActive: true,
        $or: [
          { startDate: { $exists: false }, endDate: { $exists: false } },
          { startDate: { $lte: now }, endDate: { $gte: now } },
          { startDate: { $lte: now }, endDate: { $exists: false } },
          { startDate: { $exists: false }, endDate: { $gte: now } },
        ],
      })
      .populate('services.service')
      .sort({ sortOrder: 1 })
      .exec();
  }

  async findOne(id: string): Promise<ServicePackage> {
    const pkg = await this.packageModel
      .findById(id)
      .populate('services.service')
      .exec();

    if (!pkg) {
      throw new NotFoundException('Package not found');
    }

    return pkg;
  }

  async findByCategory(category: string): Promise<ServicePackage[]> {
    return this.packageModel
      .find({ category, isActive: true })
      .populate('services.service')
      .sort({ sortOrder: 1 })
      .exec();
  }

  async update(
    id: string,
    updatePackageDto: UpdatePackageDto,
  ): Promise<ServicePackage> {
    // Recalculate discount if prices changed
    if (
      updatePackageDto.originalPrice !== undefined ||
      updatePackageDto.packagePrice !== undefined
    ) {
      const existingPackage = await this.packageModel.findById(id);
      if (!existingPackage) {
        throw new NotFoundException('Package not found');
      }

      const originalPrice =
        updatePackageDto.originalPrice ?? existingPackage.originalPrice;
      const packagePrice =
        updatePackageDto.packagePrice ?? existingPackage.packagePrice;

      if (originalPrice > 0) {
        updatePackageDto.discountPercentage = Math.round(
          ((originalPrice - packagePrice) / originalPrice) * 100,
        );
      }
    }

    const updatedPackage = await this.packageModel
      .findByIdAndUpdate(id, updatePackageDto, { new: true })
      .populate('services.service')
      .exec();

    if (!updatedPackage) {
      throw new NotFoundException('Package not found');
    }

    return updatedPackage;
  }

  async remove(id: string): Promise<void> {
    const result = await this.packageModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Package not found');
    }
  }

  async toggleActive(id: string): Promise<ServicePackage> {
    const pkg = await this.packageModel.findById(id);
    if (!pkg) {
      throw new NotFoundException('Package not found');
    }

    pkg.isActive = !pkg.isActive;
    return pkg.save();
  }

  async incrementRedemptions(id: string): Promise<ServicePackage> {
    const pkg = await this.packageModel.findById(id);
    if (!pkg) {
      throw new NotFoundException('Package not found');
    }

    if (pkg.maxRedemptions && pkg.currentRedemptions >= pkg.maxRedemptions) {
      throw new BadRequestException('Package has reached maximum redemptions');
    }

    pkg.currentRedemptions += 1;
    return pkg.save();
  }

  async getPopularPackages(limit: number = 5): Promise<ServicePackage[]> {
    return this.packageModel
      .find({ isActive: true })
      .populate('services.service')
      .sort({ currentRedemptions: -1 })
      .limit(limit)
      .exec();
  }

  async getPackageStats(): Promise<{
    totalPackages: number;
    activePackages: number;
    totalRedemptions: number;
    revenueGenerated: number;
    byCategory: { category: string; count: number }[];
  }> {
    const [stats] = await this.packageModel.aggregate([
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: null,
                totalPackages: { $sum: 1 },
                activePackages: {
                  $sum: { $cond: ['$isActive', 1, 0] },
                },
                totalRedemptions: { $sum: '$currentRedemptions' },
                revenueGenerated: {
                  $sum: { $multiply: ['$packagePrice', '$currentRedemptions'] },
                },
              },
            },
          ],
          byCategory: [
            {
              $group: {
                _id: '$category',
                count: { $sum: 1 },
              },
            },
            {
              $project: {
                _id: 0,
                category: '$_id',
                count: 1,
              },
            },
          ],
        },
      },
    ]);

    const totals = stats.totals[0] || {
      totalPackages: 0,
      activePackages: 0,
      totalRedemptions: 0,
      revenueGenerated: 0,
    };

    return {
      ...totals,
      byCategory: stats.byCategory,
    };
  }

  async validatePackageAvailability(id: string): Promise<{
    isAvailable: boolean;
    reason?: string;
  }> {
    const pkg = await this.packageModel.findById(id);

    if (!pkg) {
      return { isAvailable: false, reason: 'Package not found' };
    }

    if (!pkg.isActive) {
      return { isAvailable: false, reason: 'Package is not active' };
    }

    const now = new Date();
    if (pkg.startDate && pkg.startDate > now) {
      return { isAvailable: false, reason: 'Package has not started yet' };
    }

    if (pkg.endDate && pkg.endDate < now) {
      return { isAvailable: false, reason: 'Package has expired' };
    }

    if (pkg.maxRedemptions && pkg.currentRedemptions >= pkg.maxRedemptions) {
      return {
        isAvailable: false,
        reason: 'Package has reached maximum redemptions',
      };
    }

    return { isAvailable: true };
  }
}
