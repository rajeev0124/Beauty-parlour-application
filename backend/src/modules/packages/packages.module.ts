import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PackagesController } from './packages.controller';
import { PackagesService } from './packages.service';
import { ServicePackage, ServicePackageSchema } from './schemas/service-package.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ServicePackage.name, schema: ServicePackageSchema },
    ]),
  ],
  controllers: [PackagesController],
  providers: [PackagesService],
  exports: [PackagesService],
})
export class PackagesModule {}
