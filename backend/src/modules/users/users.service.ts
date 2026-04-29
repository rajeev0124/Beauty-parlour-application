import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from '../../schemas/user.schema';
import { Appointment, AppointmentDocument } from '../../schemas/appointment.schema';
import { Order, OrderDocument } from '../../schemas/order.schema';
import { Staff, StaffDocument } from '../../schemas/staff.schema';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Appointment.name) private appointmentModel: Model<AppointmentDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Staff.name) private staffModel: Model<StaffDocument>,
  ) {}

  async findAll(query: { role?: string; status?: string; search?: string }) {
    const filter: any = {};
    if (query.role) filter.role = query.role;
    if (query.status) filter.status = query.status;
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } },
        { phone: { $regex: query.search, $options: 'i' } },
      ];
    }
    return this.userModel.find(filter)
      .select('-password -refreshToken')
      .populate('assignedStaff', 'name email phone specialization')
      .sort({ createdAt: -1 });
  }

  async findById(id: string) {
    const user = await this.userModel.findById(id)
      .select('-password -refreshToken')
      .populate('assignedStaff', 'name email phone specialization');
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(createUserDto: CreateUserDto) {
    const existing = await this.userModel.findOne({ email: createUserDto.email });
    if (existing) throw new ConflictException('Email already exists');

    const hashedPassword = await bcrypt.hash(createUserDto.password, 12);
    const user = await this.userModel.create({ ...createUserDto, password: hashedPassword });
    const { password, refreshToken, ...result } = user.toObject();
    return result;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .select('-password -refreshToken')
      .populate('assignedStaff', 'name email phone specialization');
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async assignStaff(userId: string, staffIds: string[]) {
    // Verify all staff exist
    for (const staffId of staffIds) {
      const staff = await this.staffModel.findById(staffId);
      if (!staff) throw new NotFoundException(`Staff ${staffId} not found`);
    }

    const user = await this.userModel
      .findByIdAndUpdate(userId, { assignedStaff: staffIds }, { new: true })
      .select('-password -refreshToken')
      .populate('assignedStaff', 'name email phone specialization');
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async addStaff(userId: string, staffId: string) {
    const staff = await this.staffModel.findById(staffId);
    if (!staff) throw new NotFoundException('Staff not found');

    const user = await this.userModel
      .findByIdAndUpdate(userId, { $addToSet: { assignedStaff: staffId } }, { new: true })
      .select('-password -refreshToken')
      .populate('assignedStaff', 'name email phone specialization');
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async removeStaff(userId: string, staffId: string) {
    const user = await this.userModel
      .findByIdAndUpdate(userId, { $pull: { assignedStaff: staffId } }, { new: true })
      .select('-password -refreshToken')
      .populate('assignedStaff', 'name email phone specialization');
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async clearAllStaff(userId: string) {
    const user = await this.userModel
      .findByIdAndUpdate(userId, { assignedStaff: [] }, { new: true })
      .select('-password -refreshToken');
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async remove(id: string) {
    const user = await this.userModel.findByIdAndDelete(id);
    if (!user) throw new NotFoundException('User not found');
    return { message: 'User deleted successfully' };
  }

  async getUserOrders(id: string) {
    await this.findById(id); // verify user exists
    return this.orderModel.find({ userId: id }).sort({ createdAt: -1 });
  }

  async getUserAppointments(id: string) {
    await this.findById(id); // verify user exists
    return this.appointmentModel.find({ userId: id }).sort({ createdAt: -1 });
  }
}
