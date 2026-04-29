import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MarketingController } from './marketing.controller';
import { MarketingService } from './marketing.service';
import { Campaign, CampaignSchema } from './schemas/campaign.schema';
import { User, UserSchema } from '../../schemas/user.schema';
import { EmailModule } from '../email/email.module';
import { SmsModule } from '../sms/sms.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Campaign.name, schema: CampaignSchema },
      { name: User.name, schema: UserSchema },
    ]),
    EmailModule,
    SmsModule,
  ],
  controllers: [MarketingController],
  providers: [MarketingService],
  exports: [MarketingService],
})
export class MarketingModule {}
