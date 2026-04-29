import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Staff, StaffDocument } from '../../schemas/staff.schema';
import { CreateStaffDto, UpdateStaffDto } from './dto/staff.dto';

@Injectable()
export class StaffService {
  constructor(
    @InjectModel(Staff.name) private staffModel: Model<StaffDocument>,
  ) {}

  async findAll(query: { status?: string; availability?: string }) {
    const filter: any = {};
    if (query.status) filter.status = query.status;
    if (query.availability !== undefined) filter.availability = query.availability === 'true';
    return this.staffModel.find(filter).sort({ createdAt: -1 });
  }

  async findById(id: string) {
    const staff = await this.staffModel.findById(id);
    if (!staff) throw new NotFoundException('Staff not found');
    return staff;
  }

  async findAvailable() {
    return this.staffModel.find({ availability: true, status: 'active' });
  }

  async create(createStaffDto: CreateStaffDto) {
    return this.staffModel.create(createStaffDto);
  }

  async update(id: string, updateStaffDto: UpdateStaffDto) {
    const staff = await this.staffModel.findByIdAndUpdate(id, updateStaffDto, { new: true });
    if (!staff) throw new NotFoundException('Staff not found');
    return staff;
  }

  async remove(id: string) {
    const staff = await this.staffModel.findByIdAndDelete(id);
    if (!staff) throw new NotFoundException('Staff not found');
    return { message: 'Staff deleted successfully' };
  }
}
