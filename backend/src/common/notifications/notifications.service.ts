import { Injectable, Logger } from '@nestjs/common';
import {
  NotificationsGateway,
  NotificationEvents,
} from './notifications.gateway';

export interface NotificationPayload {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  data?: Record<string, unknown>;
  actionUrl?: string;
}

interface AppointmentData {
  serviceName?: string;
  date?: string;
  time?: string;
  userName?: string;
  [key: string]: unknown;
}

interface OrderData {
  _id?: { toString(): string };
  totalAmount?: number;
  [key: string]: unknown;
}

interface PaymentData {
  amount?: number;
  [key: string]: unknown;
}

interface ProductData {
  name?: string;
  stock?: number;
  [key: string]: unknown;
}

interface NotificationData {
  title?: string;
  message?: string;
  type?: string;
  data?: Record<string, unknown> | unknown[];
  createdAt?: Date;
  [key: string]: unknown;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly gateway: NotificationsGateway) {}

  // === Appointment Notifications ===

  notifyAppointmentCreated(userId: string, appointment: AppointmentData) {
    this.gateway.sendToUser(userId, NotificationEvents.APPOINTMENT_CREATED, {
      title: 'Appointment Booked!',
      message: `Your appointment for ${appointment.serviceName ?? 'service'} on ${appointment.date ?? 'scheduled date'} has been booked.`,
      type: 'success',
      data: appointment,
    });

    // Notify admins
    this.gateway.sendToAdmins(NotificationEvents.APPOINTMENT_CREATED, {
      title: 'New Appointment',
      message: `${appointment.userName ?? 'Customer'} booked ${appointment.serviceName ?? 'service'}`,
      type: 'info',
      data: appointment,
    });
  }

  notifyAppointmentConfirmed(userId: string, appointment: AppointmentData) {
    this.gateway.sendToUser(userId, NotificationEvents.APPOINTMENT_CONFIRMED, {
      title: 'Appointment Confirmed',
      message: `Your appointment for ${appointment.serviceName ?? 'service'} on ${appointment.date ?? 'scheduled date'} has been confirmed.`,
      type: 'success',
      data: appointment,
    });
  }

  notifyAppointmentCancelled(
    userId: string,
    appointment: AppointmentData,
    reason?: string,
  ) {
    this.gateway.sendToUser(userId, NotificationEvents.APPOINTMENT_CANCELLED, {
      title: 'Appointment Cancelled',
      message:
        reason ??
        `Your appointment for ${appointment.serviceName ?? 'service'} has been cancelled.`,
      type: 'warning',
      data: appointment,
    });
  }

  notifyAppointmentReminder(userId: string, appointment: AppointmentData) {
    this.gateway.sendToUser(userId, NotificationEvents.APPOINTMENT_REMINDER, {
      title: 'Appointment Reminder',
      message: `Reminder: Your appointment for ${appointment.serviceName ?? 'service'} is tomorrow at ${appointment.time ?? 'scheduled time'}.`,
      type: 'info',
      data: appointment,
    });
  }

  // === Order Notifications ===

  notifyOrderCreated(userId: string, order: OrderData) {
    const orderNum = order._id?.toString().slice(-6) ?? 'N/A';
    this.gateway.sendToUser(userId, NotificationEvents.ORDER_CREATED, {
      title: 'Order Placed!',
      message: `Your order #${orderNum} has been placed successfully.`,
      type: 'success',
      data: order,
    });

    this.gateway.sendToAdmins(NotificationEvents.ORDER_CREATED, {
      title: 'New Order',
      message: `New order #${orderNum} - ₹${order.totalAmount ?? 0}`,
      type: 'info',
      data: order,
    });
  }

  notifyOrderStatusChanged(
    userId: string,
    order: OrderData,
    newStatus: string,
  ) {
    const orderNum = order._id?.toString().slice(-6) ?? 'N/A';
    this.gateway.sendToUser(userId, NotificationEvents.ORDER_STATUS_CHANGED, {
      title: 'Order Update',
      message: `Your order #${orderNum} is now ${newStatus}.`,
      type: 'info',
      data: { ...order, status: newStatus },
    });
  }

  // === Payment Notifications ===

  notifyPaymentReceived(userId: string, payment: PaymentData) {
    this.gateway.sendToUser(userId, NotificationEvents.PAYMENT_RECEIVED, {
      title: 'Payment Successful',
      message: `Payment of ₹${payment.amount ?? 0} received successfully.`,
      type: 'success',
      data: payment,
    });
  }

  notifyPaymentFailed(userId: string, payment: PaymentData, reason?: string) {
    this.gateway.sendToUser(userId, NotificationEvents.PAYMENT_FAILED, {
      title: 'Payment Failed',
      message:
        reason ?? 'Your payment could not be processed. Please try again.',
      type: 'error',
      data: payment,
    });
  }

  // === Inventory Notifications ===

  notifyLowStock(product: ProductData) {
    this.gateway.sendToAdmins(NotificationEvents.LOW_STOCK_ALERT, {
      title: 'Low Stock Alert',
      message: `${product.name ?? 'Product'} is running low (${product.stock ?? 0} remaining).`,
      type: 'warning',
      data: product,
    });
  }

  notifyOutOfStock(product: ProductData) {
    this.gateway.sendToAdmins(NotificationEvents.OUT_OF_STOCK, {
      title: 'Out of Stock!',
      message: `${product.name ?? 'Product'} is out of stock!`,
      type: 'error',
      data: product,
    });
  }

  // === Loyalty Notifications ===

  notifyPointsEarned(userId: string, points: number, reason: string) {
    this.gateway.sendToUser(userId, NotificationEvents.POINTS_EARNED, {
      title: 'Points Earned!',
      message: `You earned ${points} loyalty points for ${reason}.`,
      type: 'success',
      data: { points, reason },
    });
  }

  notifyPointsRedeemed(userId: string, points: number) {
    this.gateway.sendToUser(userId, NotificationEvents.POINTS_REDEEMED, {
      title: 'Points Redeemed',
      message: `You redeemed ${points} loyalty points.`,
      type: 'info',
      data: { points },
    });
  }

  notifyTierUpgrade(userId: string, newTier: string) {
    this.gateway.sendToUser(userId, NotificationEvents.TIER_UPGRADED, {
      title: 'Tier Upgraded! 🎉',
      message: `Congratulations! You've been upgraded to ${newTier} tier!`,
      type: 'success',
      data: { tier: newTier },
    });
  }

  // === System Notifications ===

  broadcastAnnouncement(title: string, message: string) {
    this.gateway.broadcast(NotificationEvents.SYSTEM_ANNOUNCEMENT, {
      title,
      message,
      type: 'info',
    });
  }

  broadcastMaintenance(message: string, scheduledTime: Date) {
    this.gateway.broadcast(NotificationEvents.MAINTENANCE_ALERT, {
      title: 'Scheduled Maintenance',
      message,
      type: 'warning',
      data: { scheduledTime },
    });
  }

  // === Generic Notification ===

  sendNotification(userId: string, notification: NotificationPayload) {
    this.gateway.sendToUser(userId, 'notification', notification);
  }

  sendToRole(role: string, notification: NotificationPayload) {
    this.gateway.sendToRole(role, 'notification', notification);
  }

  // === Alias methods for convenience ===

  notifyUser(userId: string, data: NotificationData) {
    this.gateway.sendToUser(userId, 'notification', {
      title: data.title ?? 'Notification',
      message: data.message ?? '',
      type: data.type ?? 'info',
      data: data.data,
    });
  }

  broadcastToAdmins(data: NotificationData) {
    this.gateway.sendToAdmins('admin_notification', {
      title: data.title ?? 'Admin Alert',
      message: data.message ?? '',
      type: data.type ?? 'info',
      data: data.data,
    });
  }
}
