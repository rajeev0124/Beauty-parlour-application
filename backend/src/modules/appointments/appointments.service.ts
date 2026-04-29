import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Appointment, AppointmentDocument } from '../../schemas/appointment.schema';
import { CreateAppointmentDto, UpdateAppointmentDto, UpdateStatusDto } from './dto/appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectModel(Appointment.name) private appointmentModel: Model<AppointmentDocument>,
  ) {}

  async findAll(query: { status?: string; date?: string }) {
    const filter: any = {};
    if (query.status) filter.status = query.status;
    if (query.date) filter.date = query.date;
    return this.appointmentModel.find(filter).sort({ createdAt: -1 });
  }

  async findById(id: string) {
    const appointment = await this.appointmentModel.findById(id);
    if (!appointment) throw new NotFoundException('Appointment not found');
    return appointment;
  }

  async findByUser(userId: string) {
    // Query with both ObjectId and string to handle legacy data
    return this.appointmentModel.find({
      $or: [
        { userId: new Types.ObjectId(userId) },
        { userId: userId }
      ]
    }).sort({ createdAt: -1 });
  }

  async findByStaff(staffId: string) {
    return this.appointmentModel.find({ staffId }).sort({ date: 1, time: 1 });
  }

  async create(createAppointmentDto: CreateAppointmentDto) {
    // Ensure userId is provided (should come from controller)
    if (!createAppointmentDto.userId) {
      throw new Error('userId is required');
    }
    
    // Convert string IDs to ObjectIds for proper schema compliance
    const appointmentData: any = {
      ...createAppointmentDto,
      userId: new Types.ObjectId(createAppointmentDto.userId),
    };
    
    // Convert optional IDs if provided
    if (createAppointmentDto.serviceId) {
      appointmentData.serviceId = new Types.ObjectId(createAppointmentDto.serviceId);
    }
    if (createAppointmentDto.staffId) {
      appointmentData.staffId = new Types.ObjectId(createAppointmentDto.staffId);
    }
    
    return this.appointmentModel.create(appointmentData);
  }

  async update(id: string, updateAppointmentDto: UpdateAppointmentDto) {
    const appointment = await this.appointmentModel.findByIdAndUpdate(id, updateAppointmentDto, { new: true });
    if (!appointment) throw new NotFoundException('Appointment not found');
    return appointment;
  }

  async updateStatus(id: string, updateStatusDto: UpdateStatusDto) {
    const appointment = await this.appointmentModel.findByIdAndUpdate(
      id,
      { status: updateStatusDto.status },
      { new: true },
    );
    if (!appointment) throw new NotFoundException('Appointment not found');
    return appointment;
  }

  async remove(id: string) {
    const appointment = await this.appointmentModel.findByIdAndDelete(id);
    if (!appointment) throw new NotFoundException('Appointment not found');
    return { message: 'Appointment deleted successfully' };
  }
}
