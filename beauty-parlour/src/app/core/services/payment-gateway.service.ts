import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

declare var Razorpay: any;

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

export interface PaymentVerification {
  success: boolean;
  message: string;
  paymentId?: string;
  orderId?: string;
}

export interface RefundResponse {
  success: boolean;
  refundId: string;
  amount: number;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentGatewayService {
  private readonly apiUrl = `${environment.apiUrl}/payment-gateway`;
  private razorpayKey = environment.razorpayKey || 'rzp_test_demo';

  constructor(private http: HttpClient) {}

  createOrder(amount: number, currency: string = 'INR', receipt?: string, notes?: any): Observable<RazorpayOrder> {
    return this.http.post<RazorpayOrder>(`${this.apiUrl}/create-order`, { amount, currency, receipt, notes });
  }

  verifyPayment(paymentId: string, orderId: string, signature: string): Observable<PaymentVerification> {
    return this.http.post<PaymentVerification>(`${this.apiUrl}/verify`, { paymentId, orderId, signature });
  }

  getPaymentStatus(paymentId: string): Observable<{ status: string; amount: number; method: string }> {
    return this.http.get<{ status: string; amount: number; method: string }>(`${this.apiUrl}/status/${paymentId}`);
  }

  initiateRefund(paymentId: string, amount?: number, reason?: string): Observable<RefundResponse> {
    return this.http.post<RefundResponse>(`${this.apiUrl}/refund`, { paymentId, amount, reason });
  }

  /**
   * Open Razorpay payment modal
   */
  openPaymentModal(options: {
    amount: number;
    orderId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    description?: string;
    onSuccess: (response: any) => void;
    onError: (error: any) => void;
    onDismiss?: () => void;
  }): void {
    const razorpayOptions = {
      key: this.razorpayKey,
      amount: options.amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      name: 'Sindhura Makeovers',
      description: options.description || 'Payment for services',
      order_id: options.orderId,
      prefill: {
        name: options.customerName,
        email: options.customerEmail,
        contact: options.customerPhone
      },
      theme: {
        color: '#E91E63' // Pink theme for Sindhura Makeovers
      },
      handler: (response: any) => {
        options.onSuccess(response);
      },
      modal: {
        ondismiss: () => {
          if (options.onDismiss) options.onDismiss();
        }
      }
    };

    const razorpay = new Razorpay(razorpayOptions);
    razorpay.on('payment.failed', (response: any) => {
      options.onError(response.error);
    });
    razorpay.open();
  }

  /**
   * Complete payment flow
   */
  async processPayment(
    amount: number,
    customer: { name: string; email: string; phone: string },
    description?: string
  ): Promise<PaymentVerification> {
    return new Promise((resolve, reject) => {
      // Step 1: Create order
      this.createOrder(amount).subscribe({
        next: (order) => {
          // Step 2: Open payment modal
          this.openPaymentModal({
            amount,
            orderId: order.id,
            customerName: customer.name,
            customerEmail: customer.email,
            customerPhone: customer.phone,
            description,
            onSuccess: (response) => {
              // Step 3: Verify payment
              this.verifyPayment(
                response.razorpay_payment_id,
                response.razorpay_order_id,
                response.razorpay_signature
              ).subscribe({
                next: (verification) => resolve(verification),
                error: (err) => reject(err)
              });
            },
            onError: (error) => reject(error),
            onDismiss: () => reject({ message: 'Payment cancelled by user' })
          });
        },
        error: (err) => reject(err)
      });
    });
  }
}
