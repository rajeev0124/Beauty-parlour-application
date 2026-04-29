import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LoyaltyController } from './loyalty.controller';
import { LoyaltyService } from './loyalty.service';
import { LoyaltyPoints, LoyaltyPointsSchema } from './schemas/loyalty-points.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LoyaltyPoints.name, schema: LoyaltyPointsSchema },
    ]),
  ],
  controllers: [LoyaltyController],
  providers: [LoyaltyService],
  exports: [LoyaltyService],
})
export class LoyaltyModule {}
