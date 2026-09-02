import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Product } from '../models/product.model';
import { Service } from '../models/service.model';

export interface CartOrderItem {
  product: Product;
  quantity: number;
}

export interface AppointmentBookingPayload {
  customerName: string;
  phone: string;
  email?: string;
  serviceName: string;
  price?: number;
  duration?: number;
  date: string;
  time: string;
  stylistName?: string;
  notes?: string;
}

export interface CartOrderPayload {
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  city?: string;
  state?: string;
  pincode?: string;
  items: CartOrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  couponCode?: string;
  paymentMethod?: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class WhatsAppService {
  private readonly defaultPhoneNumber = environment.whatsAppNumber || '919876543210';

  /**
   * Get the configured parlour WhatsApp number
   */
  getWhatsAppNumber(): string {
    return (environment.whatsAppNumber || this.defaultPhoneNumber).replace(/[^0-9]/g, '');
  }

  /**
   * Opens WhatsApp with a pre-filled, properly encoded message
   */
  openWhatsApp(message: string, customPhone?: string): void {
    const phone = (customPhone || this.getWhatsAppNumber()).replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(message.trim());
    const url = `https://wa.me/${phone}?text=${encoded}`;
    
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  /**
   * Formats and sends an Appointment Booking request to WhatsApp
   */
  sendAppointmentBooking(booking: AppointmentBookingPayload): void {
    const lines: string[] = [
      '✨ *NEW APPOINTMENT BOOKING – SINDHURA MAKEOVERS* ✨',
      '────────────────────────────',
      `👤 *Client Name:* ${booking.customerName}`,
      `📱 *Phone:* ${booking.phone}`,
    ];

    if (booking.email) {
      lines.push(`✉️ *Email:* ${booking.email}`);
    }

    lines.push(
      `💅 *Service:* ${booking.serviceName}` +
      (booking.price ? ` (₹${booking.price.toLocaleString('en-IN')})` : '')
    );

    if (booking.duration) {
      lines.push(`⏳ *Duration:* ${booking.duration} mins`);
    }

    lines.push(`📅 *Preferred Date:* ${booking.date}`);
    lines.push(`🕒 *Preferred Time:* ${booking.time}`);

    if (booking.stylistName) {
      lines.push(`💇‍♀️ *Preferred Stylist:* ${booking.stylistName}`);
    }

    if (booking.notes && booking.notes.trim().length > 0) {
      lines.push(`📝 *Special Requests:* ${booking.notes.trim()}`);
    }

    lines.push('────────────────────────────');
    lines.push('_Please confirm my appointment slot. Thank you!_ 🌸');

    this.openWhatsApp(lines.join('\n'));
  }

  /**
   * Formats and sends an Itemized Product Order from Cart to WhatsApp
   */
  sendCartOrder(order: CartOrderPayload): void {
    const lines: string[] = [
      '🛍️ *NEW PRODUCT ORDER – SINDHURA MAKEOVERS* 🛍️',
      '────────────────────────────',
      '📦 *ITEMS ORDERED:*'
    ];

    order.items.forEach((item, index) => {
      const itemTotal = item.product.price * item.quantity;
      lines.push(
        `  ${index + 1}. *${item.product.name}*` +
        `\n     Qty: ${item.quantity} × ₹${item.product.price.toLocaleString('en-IN')} = ₹${itemTotal.toLocaleString('en-IN')}`
      );
    });

    lines.push('────────────────────────────');
    lines.push(`💵 *Subtotal:* ₹${order.subtotal.toLocaleString('en-IN')}`);

    if (order.discount > 0) {
      lines.push(`🏷️ *Discount${order.couponCode ? ` (${order.couponCode})` : ''}:* -₹${order.discount.toLocaleString('en-IN')}`);
    }

    lines.push(
      `🚚 *Delivery:* ${order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee.toLocaleString('en-IN')}`}`
    );
    lines.push(`💰 *FINAL TOTAL:* *₹${order.total.toLocaleString('en-IN')}*`);

    lines.push('────────────────────────────');
    lines.push('📍 *DELIVERY DETAILS:*');
    lines.push(`👤 *Name:* ${order.customerName}`);
    lines.push(`📱 *Phone:* ${order.phone}`);
    if (order.email) {
      lines.push(`✉️ *Email:* ${order.email}`);
    }
    lines.push(`🏠 *Address:* ${order.address}`);
    if (order.city || order.state || order.pincode) {
      const locationParts = [order.city, order.state, order.pincode].filter(Boolean);
      lines.push(`🏙️ *Location:* ${locationParts.join(', ')}`);
    }

    if (order.paymentMethod) {
      lines.push(`💳 *Preferred Payment:* ${order.paymentMethod.toUpperCase()}`);
    }

    if (order.notes && order.notes.trim().length > 0) {
      lines.push(`📝 *Order Notes:* ${order.notes.trim()}`);
    }

    lines.push('────────────────────────────');
    lines.push('_Please share payment details (UPI QR / link) to confirm my order!_ ✨');

    this.openWhatsApp(lines.join('\n'));
  }

  /**
   * Quick single-service inquiry via WhatsApp
   */
  sendServiceInquiry(service: Service): void {
    const lines = [
      '👋 *Hi Sindhura Makeovers!*',
      '',
      `I am interested in booking *${service.name}* (₹${service.price.toLocaleString('en-IN')}, ~${service.duration} mins).`,
      '',
      'Could you please share available slots and more details? Thank you! ✨'
    ];
    this.openWhatsApp(lines.join('\n'));
  }

  /**
   * Quick single-product inquiry / instant buy via WhatsApp
   */
  sendProductInquiry(product: Product, quantity = 1): void {
    const lines = [
      '👋 *Hi Sindhura Makeovers!*',
      '',
      `I would like to order *${product.name}* (Qty: ${quantity}, ₹${(product.price * quantity).toLocaleString('en-IN')}).`,
      '',
      'Is this currently in stock for delivery/pickup? Thank you! 🛍️'
    ];
    this.openWhatsApp(lines.join('\n'));
  }

  /**
   * General parlour concierge chat
   */
  openGeneralConcierge(): void {
    const msg = '👋 Hi Sindhura Makeovers! I have an inquiry regarding your services and products.';
    this.openWhatsApp(msg);
  }
}
