import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { CreateCouponDto, UpdateCouponDto, ValidateCouponDto } from './dto/coupon.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  // Public - Get active coupons for display
  @Get('active')
  getActiveCoupons() {
    return this.couponsService.getActiveCoupons();
  }

  // Public - Validate coupon
  @Post('validate')
  validate(@Body() validateDto: ValidateCouponDto) {
    return this.couponsService.validate(validateDto);
  }

  // Admin - Get all coupons
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  findAll(@Query() query: { active?: string }) {
    return this.couponsService.findAll(query);
  }

  // Admin - Get single coupon
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  findOne(@Param('id') id: string) {
    return this.couponsService.findOne(id);
  }

  // Admin - Create coupon
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  create(@Body() createCouponDto: CreateCouponDto) {
    return this.couponsService.create(createCouponDto);
  }

  // Admin - Update coupon
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  update(@Param('id') id: string, @Body() updateCouponDto: UpdateCouponDto) {
    return this.couponsService.update(id, updateCouponDto);
  }

  // Admin - Delete coupon
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  delete(@Param('id') id: string) {
    return this.couponsService.delete(id);
  }
}
