import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomerPortalController } from './customer-portal.controller';
import { CustomerPortalService } from './customer-portal.service';
import {
  Appointment,
  AppointmentSchema,
} from '../../schemas/appointment.schema';
import { Order, OrderSchema } from '../../schemas/order.schema';
import { Payment, PaymentSchema } from '../../schemas/payment.schema';
import { User, UserSchema } from '../../schemas/user.schema';
import { BeautyService, ServiceSchema } from '../../schemas/service.schema';
import { Product, ProductSchema } from '../../schemas/product.schema';
import { Staff, StaffSchema } from '../../schemas/staff.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Appointment.name, schema: AppointmentSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: User.name, schema: UserSchema },
      { name: BeautyService.name, schema: ServiceSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Staff.name, schema: StaffSchema },
    ]),
  ],
  controllers: [CustomerPortalController],
  providers: [CustomerPortalService],
})
export class CustomerPortalModule {}
