import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { PackagesService } from './packages.service';
import { CreatePackageDto, UpdatePackageDto } from './dto/package.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('packages')
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  // Public endpoints
  @Get()
  findAll(
    @Query('isActive') isActive?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
  ) {
    return this.packagesService.findAll({
      isActive:
        isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      category,
      search,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    });
  }

  @Get('active')
  findActive() {
    return this.packagesService.findActive();
  }

  @Get('popular')
  getPopularPackages(@Query('limit') limit?: string) {
    return this.packagesService.getPopularPackages(limit ? parseInt(limit) : 5);
  }

  @Get('category/:category')
  findByCategory(@Param('category') category: string) {
    return this.packagesService.findByCategory(category);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  getPackageStats() {
    return this.packagesService.getPackageStats();
  }

  // IMPORTANT: Specific routes MUST come before generic :id routes
  @Get(':id/availability')
  checkAvailability(@Param('id') id: string) {
    return this.packagesService.validatePackageAvailability(id);
  }

  // Generic :id route MUST be after specific routes
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.packagesService.findOne(id);
  }

  // Admin endpoints
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() createPackageDto: CreatePackageDto) {
    return this.packagesService.create(createPackageDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() updatePackageDto: UpdatePackageDto) {
    return this.packagesService.update(id, updatePackageDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.packagesService.remove(id);
  }

  @Patch(':id/toggle-active')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  toggleActive(@Param('id') id: string) {
    return this.packagesService.toggleActive(id);
  }

  @Post(':id/redeem')
  @UseGuards(JwtAuthGuard)
  redeemPackage(@Param('id') id: string) {
    return this.packagesService.incrementRedemptions(id);
  }
}
