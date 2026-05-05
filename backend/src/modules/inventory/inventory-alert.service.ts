import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron } from '@nestjs/schedule';
import { Product } from '../../schemas/product.schema';
import { NotificationsService } from '../../common/notifications/notifications.service';
import { EmailService } from '../email/email.service';

export interface AlertConfig {
  lowStockThreshold: number;
  criticalStockThreshold: number;
  expiryWarningDays: number;
  enableEmailAlerts: boolean;
  adminEmails: string[];
}

export interface AlertItem {
  itemId: string;
  name: string;
  currentStock: number;
  threshold: number;
  severity: 'low' | 'critical' | 'expiring';
  expiryDate?: Date;
}

@Injectable()
export class InventoryAlertService implements OnModuleInit {
  private readonly logger = new Logger(InventoryAlertService.name);
  private config: AlertConfig = {
    lowStockThreshold: 10,
    criticalStockThreshold: 3,
    expiryWarningDays: 30,
    enableEmailAlerts: true,
    adminEmails: ['admin@beauty.com'],
  };

  private alertHistory: Map<string, Date> = new Map(); // Prevent duplicate alerts

  constructor(
    @InjectModel(Product.name) private productModel: Model<any>,
    private notificationsService: NotificationsService,
    private emailService: EmailService,
  ) {}

  onModuleInit() {
    this.logger.log('Inventory Alert Service initialized');
  }

  /**
   * Check for low stock items - runs every day at 8 AM
   */
  @Cron('0 8 * * *', { name: 'low-stock-check' })
  async checkLowStock(): Promise<AlertItem[]> {
    this.logger.log('Running low stock check...');
    const alerts: AlertItem[] = [];

    try {
      // Find items below threshold
      const lowStockItems = await this.productModel.find({
        stock: { $lte: this.config.lowStockThreshold },
        isActive: { $ne: false },
      });

      for (const item of lowStockItems) {
        const severity =
          item.stock <= this.config.criticalStockThreshold ? 'critical' : 'low';

        alerts.push({
          itemId: item._id.toString(),
          name: item.name,
          currentStock: item.stock,
          threshold: this.config.lowStockThreshold,
          severity,
        });
      }

      // Send notifications if there are alerts
      if (alerts.length > 0) {
        await this.sendAlerts(alerts, 'stock');
      }

      this.logger.log(`Found ${alerts.length} low stock items`);
      return alerts;
    } catch (error) {
      this.logger.error('Low stock check failed:', error.message);
      return [];
    }
  }

  /**
   * Check for expiring items - runs every day at 7 AM
   */
  @Cron('0 7 * * *', { name: 'expiry-check' })
  async checkExpiringItems(): Promise<AlertItem[]> {
    this.logger.log('Running expiry check...');
    const alerts: AlertItem[] = [];

    try {
      const warningDate = new Date();
      warningDate.setDate(
        warningDate.getDate() + this.config.expiryWarningDays,
      );

      const expiringItems = await this.productModel.find({
        expiryDate: {
          $lte: warningDate,
          $gte: new Date(),
        },
        isActive: { $ne: false },
      });

      for (const item of expiringItems) {
        alerts.push({
          itemId: item._id.toString(),
          name: item.name,
          currentStock: item.stock,
          threshold: this.config.expiryWarningDays,
          severity: 'expiring',
          expiryDate: item.expiryDate,
        });
      }

      if (alerts.length > 0) {
        await this.sendAlerts(alerts, 'expiry');
      }

      this.logger.log(`Found ${alerts.length} expiring items`);
      return alerts;
    } catch (error) {
      this.logger.error('Expiry check failed:', error.message);
      return [];
    }
  }

  /**
   * Manual inventory check trigger
   */
  async runFullCheck(): Promise<{
    lowStock: AlertItem[];
    expiring: AlertItem[];
  }> {
    const [lowStock, expiring] = await Promise.all([
      this.checkLowStock(),
      this.checkExpiringItems(),
    ]);

    return { lowStock, expiring };
  }

  /**
   * Send alerts to admins
   */
  private async sendAlerts(alerts: AlertItem[], type: 'stock' | 'expiry') {
    // Prevent duplicate alerts within 24 hours
    const filteredAlerts = alerts.filter((alert) => {
      const lastAlert = this.alertHistory.get(`${type}-${alert.itemId}`);
      if (lastAlert) {
        const hoursSince =
          (Date.now() - lastAlert.getTime()) / (1000 * 60 * 60);
        return hoursSince > 24;
      }
      return true;
    });

    if (filteredAlerts.length === 0) return;

    // Update alert history
    filteredAlerts.forEach((alert) => {
      this.alertHistory.set(`${type}-${alert.itemId}`, new Date());
    });

    // Send real-time notifications
    this.notificationsService.broadcastToAdmins({
      type: type === 'stock' ? 'inventory_low_stock' : 'inventory_expiring',
      title: type === 'stock' ? 'Low Stock Alert' : 'Expiry Alert',
      message: `${filteredAlerts.length} items need attention`,
      data: filteredAlerts,
      createdAt: new Date(),
    });

    // Send email alerts
    if (this.config.enableEmailAlerts) {
      const subject =
        type === 'stock'
          ? `🚨 Low Stock Alert: ${filteredAlerts.length} items`
          : `⚠️ Expiry Alert: ${filteredAlerts.length} items`;

      const body = this.formatAlertEmail(filteredAlerts, type);

      for (const email of this.config.adminEmails) {
        try {
          await this.emailService.sendEmail({
            to: email,
            subject,
            html: body,
          });
        } catch {
          this.logger.error(`Failed to send email to ${email}`);
        }
      }
    }
  }

  /**
   * Format alert email
   */
  private formatAlertEmail(
    alerts: AlertItem[],
    type: 'stock' | 'expiry',
  ): string {
    let html = `
      <h2>Inventory ${type === 'stock' ? 'Stock' : 'Expiry'} Alert</h2>
      <p>The following items need your attention:</p>
      <table border="1" style="border-collapse: collapse; width: 100%;">
        <tr>
          <th style="padding: 8px;">Item Name</th>
          <th style="padding: 8px;">Current Stock</th>
          ${type === 'expiry' ? '<th style="padding: 8px;">Expiry Date</th>' : ''}
          <th style="padding: 8px;">Severity</th>
        </tr>
    `;

    for (const alert of alerts) {
      const severityColor =
        alert.severity === 'critical' ? '#dc3545' : '#ffc107';
      html += `
        <tr>
          <td style="padding: 8px;">${alert.name}</td>
          <td style="padding: 8px;">${alert.currentStock}</td>
          ${type === 'expiry' ? `<td style="padding: 8px;">${alert.expiryDate?.toLocaleDateString()}</td>` : ''}
          <td style="padding: 8px; background: ${severityColor}; color: white;">
            ${alert.severity.toUpperCase()}
          </td>
        </tr>
      `;
    }

    html += `
      </table>
      <p>Please take necessary action.</p>
      <p>- Beauty Parlour System</p>
    `;

    return html;
  }

  /**
   * Update alert configuration
   */
  updateConfig(newConfig: Partial<AlertConfig>): AlertConfig {
    this.config = { ...this.config, ...newConfig };
    this.logger.log('Alert configuration updated');
    return this.config;
  }

  /**
   * Get current configuration
   */
  getConfig(): AlertConfig {
    return { ...this.config };
  }

  /**
   * Get current alerts without sending
   */
  async getCurrentAlerts(): Promise<{
    lowStock: AlertItem[];
    expiring: AlertItem[];
    summary: {
      totalLowStock: number;
      criticalCount: number;
      expiringCount: number;
    };
  }> {
    const lowStockItems = await this.productModel.find({
      stock: { $lte: this.config.lowStockThreshold },
      isActive: { $ne: false },
    });

    const warningDate = new Date();
    warningDate.setDate(warningDate.getDate() + this.config.expiryWarningDays);

    const expiringItems = await this.productModel.find({
      expiryDate: { $lte: warningDate, $gte: new Date() },
      isActive: { $ne: false },
    });

    const lowStock: AlertItem[] = lowStockItems.map((item) => ({
      itemId: item._id.toString(),
      name: item.name,
      currentStock: item.stock,
      threshold: this.config.lowStockThreshold,
      severity:
        item.stock <= this.config.criticalStockThreshold ? 'critical' : 'low',
    }));

    const expiring: AlertItem[] = expiringItems.map((item) => ({
      itemId: item._id.toString(),
      name: item.name,
      currentStock: item.stock,
      threshold: this.config.expiryWarningDays,
      severity: 'expiring',
      expiryDate: item.expiryDate,
    }));

    return {
      lowStock,
      expiring,
      summary: {
        totalLowStock: lowStock.length,
        criticalCount: lowStock.filter((a) => a.severity === 'critical').length,
        expiringCount: expiring.length,
      },
    };
  }
}
