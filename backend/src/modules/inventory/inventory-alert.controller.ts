import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { InventoryAlertService } from './inventory-alert.service';

@Controller('inventory/alerts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'super-admin')
export class InventoryAlertController {
  constructor(private readonly alertService: InventoryAlertService) {}

  /**
   * Get current inventory alerts
   */
  @Get()
  async getAlerts() {
    const alerts = await this.alertService.getCurrentAlerts();
    return {
      success: true,
      data: alerts,
    };
  }

  /**
   * Run manual inventory check
   */
  @Post('check')
  async runCheck() {
    const results = await this.alertService.runFullCheck();
    return {
      success: true,
      data: results,
      message: 'Inventory check completed',
    };
  }

  /**
   * Get alert configuration
   */
  @Get('config')
  getConfig() {
    const config = this.alertService.getConfig();
    return {
      success: true,
      data: config,
    };
  }

  /**
   * Update alert configuration
   */
  @Patch('config')
  updateConfig(
    @Body() body: {
      lowStockThreshold?: number;
      criticalStockThreshold?: number;
      expiryWarningDays?: number;
      enableEmailAlerts?: boolean;
      adminEmails?: string[];
    },
  ) {
    const config = this.alertService.updateConfig(body);
    return {
      success: true,
      data: config,
      message: 'Configuration updated',
    };
  }
}
