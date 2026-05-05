import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SchedulerController } from './scheduler.controller';
import { SchedulerService } from './scheduler.service';
import {
  Appointment,
  AppointmentSchema,
} from '../../schemas/appointment.schema';
import { EmailModule } from '../email/email.module';
import { SmsModule } from '../sms/sms.module';
import { NotificationsModule } from '../../common/notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Appointment.name, schema: AppointmentSchema },
    ]),
    EmailModule,
    SmsModule,
    NotificationsModule,
  ],
  controllers: [SchedulerController],
  providers: [SchedulerService],
  exports: [SchedulerService],
})
export class SchedulerModule {}
