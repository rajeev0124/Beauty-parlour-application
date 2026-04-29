import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WaitlistController } from './waitlist.controller';
import { WaitlistService } from './waitlist.service';
import { WaitlistEntry, WaitlistEntrySchema } from './schemas/waitlist.schema';
import { Appointment, AppointmentSchema } from '../../schemas/appointment.schema';
import { NotificationsModule } from '../../common/notifications/notifications.module';
import { EmailModule } from '../email/email.module';
import { SmsModule } from '../sms/sms.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WaitlistEntry.name, schema: WaitlistEntrySchema },
      { name: Appointment.name, schema: AppointmentSchema },
    ]),
    NotificationsModule,
    EmailModule,
    SmsModule,
  ],
  controllers: [WaitlistController],
  providers: [WaitlistService],
  exports: [WaitlistService],
})
export class WaitlistModule {}
