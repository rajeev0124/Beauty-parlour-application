import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

// Note: Install @nestjs/websockets and socket.io for real-time features
// npm install @nestjs/websockets @nestjs/platform-socket.io socket.io

interface ConnectedUser {
  socketId: string;
  userId: string;
  role: string;
  connectedAt: Date;
}

/**
 * Notifications Gateway - Placeholder for WebSocket functionality
 * Install packages and uncomment decorators for real-time support:
 * npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
 */
@Injectable()
export class NotificationsGateway {
  private readonly logger = new Logger(NotificationsGateway.name);
  private connectedUsers = new Map<string, ConnectedUser>();

  constructor(private jwtService: JwtService) {
    this.logger.log(
      'NotificationsGateway initialized (WebSocket support pending package installation)',
    );
  }

  /**
   * Send notification to a specific user
   * Note: Requires @nestjs/websockets and socket.io packages for real-time support
   * Install: npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
   */
  sendToUser(userId: string, event: string, data: unknown) {
    this.logger.debug(
      `[Notification] Event: ${event}, User: ${userId}, Data: ${JSON.stringify(data)}`,
    );
    // WebSocket implementation pending - notifications are logged for now
  }

  /**
   * Send notification to all users with a specific role
   */

  sendToRole(role: string, event: string, _data: unknown) {
    this.logger.debug(`[Placeholder] Would send ${event} to role ${role}`);
  }

  /**
   * Send notification to all admin users
   */
  sendToAdmins(event: string, data: unknown) {
    this.sendToRole('admin', event, data);
    this.sendToRole('superadmin', event, data);
  }

  /**
   * Send notification to all connected users
   */

  broadcast(event: string, _data: unknown) {
    this.logger.debug(`[Placeholder] Would broadcast ${event} to all users`);
  }

  /**
   * Get connected users count
   */
  getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  /**
   * Get online users
   */
  getOnlineUsers(): ConnectedUser[] {
    return Array.from(this.connectedUsers.values());
  }
}

// === Notification Types ===

export const NotificationEvents = {
  // Appointments
  APPOINTMENT_CREATED: 'appointment:created',
  APPOINTMENT_UPDATED: 'appointment:updated',
  APPOINTMENT_CANCELLED: 'appointment:cancelled',
  APPOINTMENT_REMINDER: 'appointment:reminder',
  APPOINTMENT_CONFIRMED: 'appointment:confirmed',

  // Orders
  ORDER_CREATED: 'order:created',
  ORDER_STATUS_CHANGED: 'order:statusChanged',
  ORDER_SHIPPED: 'order:shipped',
  ORDER_DELIVERED: 'order:delivered',

  // Payments
  PAYMENT_RECEIVED: 'payment:received',
  PAYMENT_FAILED: 'payment:failed',
  REFUND_PROCESSED: 'refund:processed',

  // Inventory
  LOW_STOCK_ALERT: 'inventory:lowStock',
  OUT_OF_STOCK: 'inventory:outOfStock',

  // Loyalty
  POINTS_EARNED: 'loyalty:pointsEarned',
  POINTS_REDEEMED: 'loyalty:pointsRedeemed',
  TIER_UPGRADED: 'loyalty:tierUpgraded',

  // System
  SYSTEM_ANNOUNCEMENT: 'system:announcement',
  MAINTENANCE_ALERT: 'system:maintenance',
};
