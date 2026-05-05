import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron } from '@nestjs/schedule';
import { Appointment } from '../../schemas/appointment.schema';
import { EmailService } from '../email/email.service';
import { SmsService } from '../sms/sms.service';
import { NotificationsService } from '../../common/notifications/notifications.service';

export interface ScheduledJob {
  id: string;
  name: string;
  schedule: string;
  lastRun?: Date;
  nextRun?: Date;
  enabled: boolean;
  status: 'idle' | 'running' | 'failed';
}

@Injectable()
export class SchedulerService implements OnModuleInit {
  private readonly logger = new Logger(SchedulerService.name);
  private jobs: Map<string, ScheduledJob> = new Map();

  constructor(
    @InjectModel(Appointment.name) private appointmentModel: Model<any>,
    private emailService: EmailService,
    private smsService: SmsService,
    private notificationsService: NotificationsService,
  ) {}

  onModuleInit() {
    this.registerJobs();
    this.logger.log('Scheduler service initialized with appointment reminders');
  }

  private registerJobs() {
    this.jobs.set('appointment-reminder-24h', {
      id: 'appointment-reminder-24h',
      name: '24-Hour Appointment Reminder',
      schedule: '0 9 * * *', // Every day at 9 AM
      enabled: true,
      status: 'idle',
    });

    this.jobs.set('appointment-reminder-1h', {
      id: 'appointment-reminder-1h',
      name: '1-Hour Appointment Reminder',
      schedule: '0 * * * *', // Every hour
      enabled: true,
      status: 'idle',
    });

    this.jobs.set('no-show-detection', {
      id: 'no-show-detection',
      name: 'No-Show Detection',
      schedule: '*/30 * * * *', // Every 30 minutes
      enabled: true,
      status: 'idle',
    });

    this.jobs.set('inventory-alerts', {
      id: 'inventory-alerts',
      name: 'Low Inventory Alerts',
      schedule: '0 8 * * *', // Every day at 8 AM
      enabled: true,
      status: 'idle',
    });
  }

  /**
   * Send 24-hour appointment reminders (runs daily at 9 AM)
   */
  @Cron('0 9 * * *', { name: 'appointment-reminder-24h' })
  async sendDailyReminders() {
    const job = this.jobs.get('appointment-reminder-24h');
    if (!job?.enabled) return;

    job.status = 'running';
    this.logger.log('Starting 24-hour appointment reminders...');

    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      const appointments = await this.appointmentModel.find({
        date: tomorrowStr,
        status: { $in: ['pending', 'confirmed'] },
      });

      this.logger.log(`Found ${appointments.length} appointments for tomorrow`);

      for (const apt of appointments) {
        // Send email reminder
        await this.emailService.sendAppointmentReminder(
          apt.userEmail || '',
          apt.userName,
          {
            serviceName: apt.serviceName,
            staffName: apt.staffName || 'Staff',
            date: apt.date,
            time: apt.time,
          },
        );

        // Send real-time notification
        this.notificationsService.notifyAppointmentReminder(
          apt.userId?.toString(),
          apt,
        );

        // Send SMS if phone available
        if (apt.userPhone) {
          await this.smsService.sendSms({
            to: apt.userPhone,
            message: `Reminder: Your appointment for ${apt.serviceName} is tomorrow at ${apt.time}. - Beauty Parlour`,
          });
        }
      }

      job.lastRun = new Date();
      job.status = 'idle';
      this.logger.log(`Sent ${appointments.length} reminders successfully`);
    } catch (error) {
      job.status = 'failed';
      this.logger.error('Failed to send reminders:', error.message);
    }
  }

  /**
   * Send 1-hour appointment reminders (runs every hour)
   */
  @Cron('0 * * * *', { name: 'appointment-reminder-1h' })
  async sendHourlyReminders() {
    const job = this.jobs.get('appointment-reminder-1h');
    if (!job?.enabled) return;

    job.status = 'running';

    try {
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
      const todayStr = now.toISOString().split('T')[0];
      const targetHour = oneHourLater.getHours().toString().padStart(2, '0');

      const appointments = await this.appointmentModel.find({
        date: todayStr,
        time: { $regex: `^${targetHour}:` },
        status: { $in: ['pending', 'confirmed'] },
      });

      for (const apt of appointments) {
        this.notificationsService.notifyAppointmentReminder(
          apt.userId?.toString(),
          apt,
        );

        if (apt.userPhone) {
          await this.smsService.sendSms({
            to: apt.userPhone,
            message: `Reminder: Your appointment for ${apt.serviceName} is in 1 hour at ${apt.time}. Beauty Parlour`,
          });
        }
      }

      job.lastRun = new Date();
      job.status = 'idle';
    } catch (error) {
      job.status = 'failed';
      this.logger.error('Hourly reminder failed:', error.message);
    }
  }

  /**
   * Detect no-shows (runs every 30 minutes)
   */
  @Cron('*/30 * * * *', { name: 'no-show-detection' })
  async detectNoShows() {
    const job = this.jobs.get('no-show-detection');
    if (!job?.enabled) return;

    job.status = 'running';

    try {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];

      // Find appointments that should have started but are still pending/confirmed
      const appointments = await this.appointmentModel.find({
        date: todayStr,
        status: { $in: ['pending', 'confirmed'] },
      });

      for (const apt of appointments) {
        const [hours, minutes] = apt.time.split(':').map(Number);
        const aptTime = new Date(now);
        aptTime.setHours(hours, minutes, 0, 0);

        // If appointment time + 30 min grace period has passed
        if (aptTime.getTime() + 30 * 60 * 1000 < now.getTime()) {
          await this.appointmentModel.findByIdAndUpdate(apt._id, {
            status: 'no-show',
            notes: (apt.notes || '') + '\n[Auto] Marked as no-show by system',
          });

          this.logger.log(`Marked appointment ${apt._id} as no-show`);
        }
      }

      job.lastRun = new Date();
      job.status = 'idle';
    } catch (error) {
      job.status = 'failed';
      this.logger.error('No-show detection failed:', error.message);
    }
  }

  /**
   * Get all scheduled jobs status
   */
  getJobsStatus(): ScheduledJob[] {
    return Array.from(this.jobs.values());
  }

  /**
   * Enable/disable a job
   */
  setJobEnabled(jobId: string, enabled: boolean): boolean {
    const job = this.jobs.get(jobId);
    if (job) {
      job.enabled = enabled;
      this.logger.log(`Job ${jobId} ${enabled ? 'enabled' : 'disabled'}`);
      return true;
    }
    return false;
  }

  /**
   * Manually trigger a job
   */
  async triggerJob(jobId: string): Promise<boolean> {
    switch (jobId) {
      case 'appointment-reminder-24h':
        await this.sendDailyReminders();
        return true;
      case 'appointment-reminder-1h':
        await this.sendHourlyReminders();
        return true;
      case 'no-show-detection':
        await this.detectNoShows();
        return true;
      default:
        return false;
    }
  }
}
