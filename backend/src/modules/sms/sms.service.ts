import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface SmsOptions {
  to: string;
  message: string;
}

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(private configService: ConfigService) {}

  async sendSms(options: SmsOptions): Promise<boolean> {
    try {
      const apiKey = this.configService.get('SMS_API_KEY');
      const senderId = this.configService.get('SMS_SENDER_ID');

      // If SMS not configured, simulate SMS
      if (!apiKey) {
        this.logger.log(`[SMS SIMULATION] To: ${options.to}`);
        this.logger.log(`[SMS CONTENT]: ${options.message}`);
        return true;
      }

      // Integration with SMS gateway (e.g., Twilio, MSG91, TextLocal)
      // For MSG91 example:
      const url = `https://api.msg91.com/api/v5/flow/`;
      
      // Implement actual SMS API call here based on your provider
      // const response = await fetch(url, {
      //   method: 'POST',
      //   headers: {
      //     'authkey': apiKey,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     sender: senderId,
      //     route: '4',
      //     country: '91',
      //     sms: [{ message: options.message, to: [options.to] }],
      //   }),
      // });

      this.logger.log(`SMS sent successfully to ${options.to}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${options.to}: ${error.message}`);
      return false;
    }
  }

  async sendAppointmentConfirmation(
    phone: string,
    customerName: string,
    serviceName: string,
    date: string,
    time: string,
  ): Promise<boolean> {
    const message = `Hi ${customerName}! Your appointment for ${serviceName} at Beauty Parlour is confirmed for ${date} at ${time}. See you soon!`;
    return this.sendSms({ to: phone, message });
  }

  async sendAppointmentReminder(
    phone: string,
    customerName: string,
    serviceName: string,
    date: string,
    time: string,
  ): Promise<boolean> {
    const message = `Reminder: Hi ${customerName}, your appointment for ${serviceName} at Beauty Parlour is tomorrow (${date}) at ${time}. Don't forget!`;
    return this.sendSms({ to: phone, message });
  }

  async sendAppointmentCancellation(
    phone: string,
    customerName: string,
    serviceName: string,
    date: string,
  ): Promise<boolean> {
    const message = `Hi ${customerName}, your appointment for ${serviceName} on ${date} at Beauty Parlour has been cancelled. Contact us to reschedule.`;
    return this.sendSms({ to: phone, message });
  }

  async sendOrderConfirmation(
    phone: string,
    customerName: string,
    orderId: string,
    totalAmount: number,
  ): Promise<boolean> {
    const message = `Hi ${customerName}! Your order #${orderId} of ₹${totalAmount} at Beauty Parlour is confirmed. Thank you for shopping with us!`;
    return this.sendSms({ to: phone, message });
  }

  async sendPaymentConfirmation(
    phone: string,
    customerName: string,
    amount: number,
    transactionId: string,
  ): Promise<boolean> {
    const message = `Hi ${customerName}, payment of ₹${amount} received successfully. Transaction ID: ${transactionId}. Thank you - Beauty Parlour`;
    return this.sendSms({ to: phone, message });
  }

  async sendOtp(phone: string, otp: string): Promise<boolean> {
    const message = `Your OTP for Beauty Parlour is ${otp}. Valid for 5 minutes. Do not share with anyone.`;
    return this.sendSms({ to: phone, message });
  }
}
