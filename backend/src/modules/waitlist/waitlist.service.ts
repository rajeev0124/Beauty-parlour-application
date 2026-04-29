import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cron } from '@nestjs/schedule';
import { WaitlistEntry } from './schemas/waitlist.schema';
import { Appointment } from '../../schemas/appointment.schema';
import { NotificationsService } from '../../common/notifications/notifications.service';
import { EmailService } from '../email/email.service';
import { SmsService } from '../sms/sms.service';

interface JoinWaitlistDto {
  userId: string;
  serviceId: string;
  serviceName: string;
  preferredDate: string;
  preferredTimeSlots?: string[];
  preferredStaffId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  notes?: string;
  priority?: number;
}

@Injectable()
export class WaitlistService {
  private readonly logger = new Logger(WaitlistService.name);
  private readonly NOTIFICATION_EXPIRY_HOURS = 4; // Slot held for 4 hours after notification

  constructor(
    @InjectModel(WaitlistEntry.name) private waitlistModel: Model<any>,
    @InjectModel(Appointment.name) private appointmentModel: Model<any>,
    private notificationsService: NotificationsService,
    private emailService: EmailService,
    private smsService: SmsService,
  ) {}

  /**
   * Join waitlist for a service
   */
  async join(dto: JoinWaitlistDto): Promise<WaitlistEntry> {
    // Check if already on waitlist for same service/date
    const existing = await this.waitlistModel.findOne({
      userId: dto.userId,
      serviceId: dto.serviceId,
      preferredDate: dto.preferredDate,
      status: 'waiting',
    });

    if (existing) {
      throw new BadRequestException('Already on waitlist for this service and date');
    }

    const entry = new this.waitlistModel({
      ...dto,
      userId: new Types.ObjectId(dto.userId),
      status: 'waiting',
    });

    this.logger.log(`Customer ${dto.customerName} joined waitlist for ${dto.serviceName} on ${dto.preferredDate}`);
    return entry.save();
  }

  /**
   * Get user's waitlist entries
   */
  async getMyWaitlist(userId: string): Promise<WaitlistEntry[]> {
    return this.waitlistModel.find({
      userId: userId,
      status: { $in: ['waiting', 'notified'] },
    }).sort({ preferredDate: 1 });
  }

  /**
   * Cancel waitlist entry
   */
  async cancel(entryId: string, userId: string): Promise<void> {
    const entry = await this.waitlistModel.findOneAndUpdate(
      {
        _id: entryId,
        userId: userId,
        status: { $in: ['waiting', 'notified'] },
      },
      { status: 'cancelled' },
    );

    if (!entry) {
      throw new NotFoundException('Waitlist entry not found');
    }
  }

  /**
   * Check for available slots and notify waitlisted customers
   * Runs every 15 minutes
   */
  @Cron('*/15 * * * *', { name: 'waitlist-check' })
  async checkAvailability(): Promise<void> {
    this.logger.log('Checking waitlist for available slots...');

    const today = new Date().toISOString().split('T')[0];
    
    // Get waiting entries for today and upcoming days
    const waitingEntries = await this.waitlistModel.find({
      status: 'waiting',
      preferredDate: { $gte: today },
    }).sort({ priority: -1, createdAt: 1 }); // VIPs first, then FIFO

    for (const entry of waitingEntries) {
      // Check if any preferred time slot is now available
      const availableSlot = await this.findAvailableSlot(entry);
      
      if (availableSlot) {
        await this.notifyCustomer(entry, availableSlot);
      }
    }
  }

  /**
   * Find available slot matching waitlist preferences
   */
  private async findAvailableSlot(entry: WaitlistEntry): Promise<string | null> {
    const timeSlots = entry.preferredTimeSlots?.length 
      ? entry.preferredTimeSlots 
      : ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];

    for (const slot of timeSlots) {
      const existingAppointment = await this.appointmentModel.findOne({
        date: entry.preferredDate,
        time: slot,
        serviceId: entry.serviceId,
        ...(entry.preferredStaffId ? { staffId: entry.preferredStaffId } : {}),
        status: { $ne: 'cancelled' },
      });

      if (!existingAppointment) {
        return slot;
      }
    }

    return null;
  }

  /**
   * Notify customer about available slot
   */
  private async notifyCustomer(entry: WaitlistEntry, timeSlot: string): Promise<void> {
    // Update entry status
    entry.status = 'notified';
    entry.notifiedAt = new Date();
    entry.expiresAt = new Date(Date.now() + this.NOTIFICATION_EXPIRY_HOURS * 60 * 60 * 1000);
    await (entry as any).save();

    const message = `Great news! A slot is available for ${entry.serviceName} on ${entry.preferredDate} at ${timeSlot}. Book now - this slot is reserved for you for ${this.NOTIFICATION_EXPIRY_HOURS} hours!`;

    // Send real-time notification
    this.notificationsService.notifyUser(entry.userId.toString(), {
      type: 'waitlist_available',
      title: 'Slot Available!',
      message,
      data: {
        entryId: (entry as any)._id.toString(),
        serviceId: entry.serviceId,
        serviceName: entry.serviceName,
        date: entry.preferredDate,
        time: timeSlot,
        expiresAt: entry.expiresAt,
      },
    });

    // Send email
    await this.emailService.sendEmail({
      to: entry.customerEmail,
      subject: `Slot Available for ${entry.serviceName}`,
      html: `
        <h2>Good News, ${entry.customerName}!</h2>
        <p>${message}</p>
        <p><strong>Service:</strong> ${entry.serviceName}</p>
        <p><strong>Date:</strong> ${entry.preferredDate}</p>
        <p><strong>Time:</strong> ${timeSlot}</p>
        <p>This slot is reserved for you until ${entry.expiresAt?.toLocaleString()}</p>
        <p><a href="${process.env.FRONTEND_URL || 'http://localhost:4200'}/appointments/book">Book Now</a></p>
      `,
    });

    // Send SMS if phone available
    if (entry.customerPhone) {
      await this.smsService.sendSms({ to: entry.customerPhone, message });
    }

    this.logger.log(`Notified ${entry.customerEmail} about available slot`);
  }

  /**
   * Mark waitlist entry as booked
   */
  async markAsBooked(entryId: string, appointmentId: string): Promise<void> {
    await this.waitlistModel.findByIdAndUpdate(entryId, {
      status: 'booked',
      bookedAppointmentId: appointmentId,
    });
  }

  /**
   * Expire old notifications - runs every hour
   */
  @Cron('0 * * * *', { name: 'waitlist-expire' })
  async expireOldNotifications(): Promise<void> {
    const now = new Date();

    const expired = await this.waitlistModel.updateMany(
      {
        status: 'notified',
        expiresAt: { $lt: now },
      },
      { status: 'expired' },
    );

    if (expired.modifiedCount > 0) {
      this.logger.log(`Expired ${expired.modifiedCount} waitlist notifications`);
    }
  }

  /**
   * Get all waitlist entries (admin)
   */
  async getAllWaitlist(query: {
    date?: string;
    serviceId?: string;
    status?: string;
  }): Promise<WaitlistEntry[]> {
    const filter: any = {};
    
    if (query.date) filter.preferredDate = query.date;
    if (query.serviceId) filter.serviceId = query.serviceId;
    if (query.status) filter.status = query.status;

    return this.waitlistModel.find(filter)
      .populate('userId', 'name email phone')
      .sort({ preferredDate: 1, priority: -1 });
  }

  /**
   * Get waitlist statistics
   */
  async getStats(): Promise<{
    totalWaiting: number;
    totalNotified: number;
    totalBooked: number;
    byService: Record<string, number>;
    byDate: Record<string, number>;
  }> {
    const entries = await this.waitlistModel.find({
      status: { $in: ['waiting', 'notified', 'booked'] },
    });

    const stats = {
      totalWaiting: 0,
      totalNotified: 0,
      totalBooked: 0,
      byService: {} as Record<string, number>,
      byDate: {} as Record<string, number>,
    };

    for (const entry of entries) {
      if (entry.status === 'waiting') stats.totalWaiting++;
      else if (entry.status === 'notified') stats.totalNotified++;
      else if (entry.status === 'booked') stats.totalBooked++;

      stats.byService[entry.serviceName] = 
        (stats.byService[entry.serviceName] || 0) + 1;
      stats.byDate[entry.preferredDate] = 
        (stats.byDate[entry.preferredDate] || 0) + 1;
    }

    return stats;
  }

  /**
   * Manually notify next in waitlist (admin)
   */
  async notifyNext(serviceId: string, date: string, time: string): Promise<WaitlistEntry | null> {
    const nextEntry = await this.waitlistModel.findOne({
      serviceId,
      preferredDate: date,
      status: 'waiting',
      $or: [
        { preferredTimeSlots: { $size: 0 } },
        { preferredTimeSlots: time },
      ],
    }).sort({ priority: -1, createdAt: 1 });

    if (nextEntry) {
      await this.notifyCustomer(nextEntry, time);
      return nextEntry;
    }

    return null;
  }

  /**
   * Update priority (admin - for VIP customers)
   */
  async updatePriority(entryId: string, priority: number): Promise<WaitlistEntry> {
    const entry = await this.waitlistModel.findByIdAndUpdate(
      entryId,
      { priority },
      { new: true },
    );

    if (!entry) {
      throw new NotFoundException('Waitlist entry not found');
    }

    return entry;
  }
}
