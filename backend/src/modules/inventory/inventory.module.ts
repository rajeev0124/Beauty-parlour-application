import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { InventoryAlertController } from './inventory-alert.controller';
import { InventoryAlertService } from './inventory-alert.service';
import { Product, ProductSchema } from '../../schemas/product.schema';
import { NotificationsModule } from '../../common/notifications/notifications.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    NotificationsModule,
    EmailModule,
  ],
  controllers: [InventoryController, InventoryAlertController],
  providers: [InventoryService, InventoryAlertService],
  exports: [InventoryService, InventoryAlertService],
})
export class InventoryModule {}
