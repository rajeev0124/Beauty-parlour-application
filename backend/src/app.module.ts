import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ScheduleModule as NestScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';
import { join } from 'path';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { User, UserSchema } from './schemas/user.schema';
import { AutoSeedService } from './common/services/auto-seed.service';
import { ServicesModule } from './modules/services/services.module';
import { StaffModule } from './modules/staff/staff.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { UploadModule } from './modules/upload/upload.module';
import { EmailModule } from './modules/email/email.module';
import { SmsModule } from './modules/sms/sms.module';
import { ReportsModule } from './modules/reports/reports.module';
import { PaymentGatewayModule } from './modules/payment-gateway/payment-gateway.module';
import { CustomerPortalModule } from './modules/customer-portal/customer-portal.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { CouponsModule } from './modules/coupons/coupons.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { InvoiceModule } from './modules/invoice/invoice.module';
import { LoyaltyModule } from './modules/loyalty/loyalty.module';
import { PackagesModule } from './modules/packages/packages.module';
import { ScheduleModule } from './modules/schedule/schedule.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { GiftCardsModule } from './modules/gift-cards/gift-cards.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { SchedulerModule } from './modules/scheduler/scheduler.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { MarketingModule } from './modules/marketing/marketing.module';
import { WaitlistModule as WaitlistManagementModule } from './modules/waitlist/waitlist.module';
import { HealthController } from './health.controller';
import { LoggerModule, LoggingMiddleware } from './common/logger';
import { CacheModule } from './common/cache';
import { AuditModule } from './common/audit';
import { NotificationsModule } from './common/notifications';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri:
          process.env.MONGODB_URI || 'mongodb://localhost:27017/beauty-parlour',
        retryAttempts: 3,
        retryDelay: 1000,
        connectionFactory: (connection: {
          on: (event: string, handler: (err?: Error) => void) => void;
        }) => {
          connection.on('connected', () => {
            console.log('✅ MongoDB connected successfully');
          });
          connection.on('error', (err?: Error) => {
            console.error('❌ MongoDB connection error:', err?.message);
          });
          connection.on('disconnected', () => {
            console.warn('⚠️ MongoDB disconnected');
          });
          return connection;
        },
      }),
    }),
    // Rate limiting: 100 requests per minute for general, 10 for auth
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 5 }, // 5 req/sec burst protection
      { name: 'medium', ttl: 10000, limit: 30 }, // 30 req/10sec
      { name: 'long', ttl: 60000, limit: 100 }, // 100 req/min
    ]),
    LoggerModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    // User schema for auto-seed service
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    AuthModule,
    UsersModule,
    ServicesModule,
    StaffModule,
    AppointmentsModule,
    ProductsModule,
    OrdersModule,
    PaymentsModule,
    InventoryModule,
    UploadModule,
    EmailModule,
    SmsModule,
    ReportsModule,
    PaymentGatewayModule,
    CustomerPortalModule,
    ReviewsModule,
    CouponsModule,
    ExpensesModule,
    InvoiceModule,
    LoyaltyModule,
    PackagesModule,
    ScheduleModule,
    WishlistModule,
    GiftCardsModule,
    FeedbackModule,
    CacheModule,
    AuditModule,
    NotificationsModule,
    // New modules for production-ready features
    NestScheduleModule.forRoot(), // Cron jobs
    SchedulerModule, // Appointment reminders
    AttendanceModule, // Staff attendance tracking
    MarketingModule, // Marketing campaigns
    WaitlistManagementModule, // Waitlist for full slots
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    AutoSeedService, // Auto-creates admin users on startup
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
