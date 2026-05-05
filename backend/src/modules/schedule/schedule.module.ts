import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import {
  StaffSchedule,
  StaffScheduleSchema,
} from './schemas/staff-schedule.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StaffSchedule.name, schema: StaffScheduleSchema },
    ]),
  ],
  controllers: [ScheduleController],
  providers: [ScheduleService],
  exports: [ScheduleService],
})
export class ScheduleModule {}
