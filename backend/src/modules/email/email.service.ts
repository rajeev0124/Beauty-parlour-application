import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    // Create transporter - configure with your SMTP settings
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST') || 'smtp.gmail.com',
      port: parseInt(this.configService.get('SMTP_PORT') || '587'),
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER') || '',
        pass: this.configService.get('SMTP_PASS') || '',
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const smtpUser = this.configService.get('SMTP_USER') || '';
      // If SMTP not configured or has placeholder values, log the email instead
      const isPlaceholder = !smtpUser || smtpUser.includes('your-email') || smtpUser === '';
      
      if (isPlaceholder) {
        console.log('\n========================================');
        console.log('[EMAIL SIMULATION] To:', options.to);
        console.log('[EMAIL SIMULATION] Subject:', options.subject);
        // Extract and log reset link if present
        const linkMatch = options.html?.match(/href="([^"]*reset-password[^"]*)"/);
        if (linkMatch) {
          console.log('\n🔗 RESET LINK (copy this to browser):');
          console.log(linkMatch[1]);
        }
        console.log('========================================\n');
        return true;
      }

      await this.transporter.sendMail({
        from: this.configService.get('SMTP_FROM') || 'Beauty Parlour <noreply@beautyparlour.com>',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      this.logger.log(`Email sent successfully to ${options.to}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}: ${error.message}`);
      return false;
    }
  }

  async sendAppointmentConfirmation(
    userEmail: string,
    userName: string,
    appointmentDetails: {
      serviceName: string;
      staffName: string;
      date: string;
      time: string;
      totalAmount: number;
    },
  ): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #e91e63, #9c27b0); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Beauty Parlour</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">Appointment Confirmed! ✨</h2>
          <p>Dear ${userName},</p>
          <p>Your appointment has been successfully booked. Here are the details:</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Service:</strong> ${appointmentDetails.serviceName}</p>
            <p><strong>Stylist:</strong> ${appointmentDetails.staffName}</p>
            <p><strong>Date:</strong> ${appointmentDetails.date}</p>
            <p><strong>Time:</strong> ${appointmentDetails.time}</p>
            <p><strong>Total Amount:</strong> ₹${appointmentDetails.totalAmount}</p>
          </div>
          <p style="color: #666;">Please arrive 10 minutes before your appointment time.</p>
          <p>Thank you for choosing Beauty Parlour!</p>
        </div>
        <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
          <p>© 2024 Beauty Parlour. All rights reserved.</p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: '✨ Appointment Confirmed - Beauty Parlour',
      html,
      text: `Your appointment for ${appointmentDetails.serviceName} on ${appointmentDetails.date} at ${appointmentDetails.time} has been confirmed.`,
    });
  }

  async sendAppointmentReminder(
    userEmail: string,
    userName: string,
    appointmentDetails: {
      serviceName: string;
      staffName: string;
      date: string;
      time: string;
    },
  ): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #e91e63, #9c27b0); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Beauty Parlour</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">Appointment Reminder 🔔</h2>
          <p>Dear ${userName},</p>
          <p>This is a friendly reminder about your upcoming appointment:</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Service:</strong> ${appointmentDetails.serviceName}</p>
            <p><strong>Stylist:</strong> ${appointmentDetails.staffName}</p>
            <p><strong>Date:</strong> ${appointmentDetails.date}</p>
            <p><strong>Time:</strong> ${appointmentDetails.time}</p>
          </div>
          <p style="color: #666;">We look forward to seeing you!</p>
        </div>
        <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
          <p>© 2024 Beauty Parlour. All rights reserved.</p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: '🔔 Appointment Reminder - Beauty Parlour',
      html,
      text: `Reminder: Your appointment for ${appointmentDetails.serviceName} is on ${appointmentDetails.date} at ${appointmentDetails.time}.`,
    });
  }

  async sendOrderConfirmation(
    userEmail: string,
    userName: string,
    orderDetails: {
      orderId: string;
      items: { name: string; quantity: number; price: number }[];
      totalAmount: number;
    },
  ): Promise<boolean> {
    const itemsHtml = orderDetails.items
      .map(
        (item) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">₹${item.price}</td>
        </tr>
      `,
      )
      .join('');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #e91e63, #9c27b0); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Beauty Parlour</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">Order Confirmed! 🛍️</h2>
          <p>Dear ${userName},</p>
          <p>Thank you for your order! Order ID: <strong>${orderDetails.orderId}</strong></p>
          <table style="width: 100%; background: white; border-radius: 8px; margin: 20px 0;">
            <thead>
              <tr style="background: #f0f0f0;">
                <th style="padding: 12px; text-align: left;">Item</th>
                <th style="padding: 12px; text-align: center;">Qty</th>
                <th style="padding: 12px; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 12px; font-weight: bold;">Total</td>
                <td style="padding: 12px; text-align: right; font-weight: bold;">₹${orderDetails.totalAmount}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
          <p>© 2024 Beauty Parlour. All rights reserved.</p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: '🛍️ Order Confirmed - Beauty Parlour',
      html,
      text: `Your order ${orderDetails.orderId} has been confirmed. Total: ₹${orderDetails.totalAmount}`,
    });
  }

  async sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #e91e63, #9c27b0); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Beauty Parlour</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">Welcome to Beauty Parlour! 💄</h2>
          <p>Dear ${userName},</p>
          <p>Thank you for joining Beauty Parlour! We're excited to have you as part of our family.</p>
          <p>With your account, you can:</p>
          <ul>
            <li>Book appointments online</li>
            <li>Browse our services and products</li>
            <li>Track your appointment history</li>
            <li>Get exclusive offers and discounts</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:4200/login" style="background: #e91e63; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">Book Your First Appointment</a>
          </div>
        </div>
        <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
          <p>© 2024 Beauty Parlour. All rights reserved.</p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: '💄 Welcome to Beauty Parlour!',
      html,
      text: `Welcome to Beauty Parlour, ${userName}! Start booking your appointments today.`,
    });
  }

  async sendPasswordReset(userEmail: string, resetToken: string): Promise<boolean> {
    const resetLink = `http://localhost:4200/reset-password?token=${resetToken}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #e91e63, #9c27b0); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Beauty Parlour</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">Password Reset Request 🔐</h2>
          <p>You requested to reset your password. Click the button below to proceed:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background: #e91e63; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">Reset Password</a>
          </div>
          <p style="color: #666; font-size: 12px;">This link will expire in 1 hour. If you didn't request this, please ignore this email.</p>
        </div>
        <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
          <p>© 2024 Beauty Parlour. All rights reserved.</p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: '🔐 Password Reset - Beauty Parlour',
      html,
      text: `Reset your password by visiting: ${resetLink}`,
    });
  }
}
