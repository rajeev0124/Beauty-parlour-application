import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface InvoiceItem {
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  tax?: number;
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  type: 'appointment' | 'order';
  referenceId: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address?: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  couponCode?: string;
  total: number;
  paymentStatus: 'pending' | 'paid' | 'partial' | 'refunded';
  paymentMethod?: string;
  paidAmount: number;
  dueAmount: number;
  notes?: string;
  issuedDate: Date;
  dueDate?: Date;
  paidDate?: Date;
}

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private readonly apiUrl = `${environment.apiUrl}/invoice`;

  constructor(private http: HttpClient) {}

  getAppointmentInvoice(appointmentId: string): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.apiUrl}/appointment/${appointmentId}`);
  }

  getOrderInvoice(orderId: string): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.apiUrl}/order/${orderId}`);
  }

  downloadInvoicePdf(invoiceId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${invoiceId}/pdf`, { responseType: 'blob' });
  }

  sendInvoiceEmail(invoiceId: string, email?: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/${invoiceId}/send`, { email });
  }

  /**
   * Utility method to print invoice
   */
  printInvoice(invoice: Invoice): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = this.generateInvoiceHtml(invoice);
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  }

  private generateInvoiceHtml(invoice: Invoice): string {
    const itemsHtml = invoice.items.map(item => `
      <tr>
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>₹${item.unitPrice.toFixed(2)}</td>
        <td>₹${item.total.toFixed(2)}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - ${invoice.invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { color: #E91E63; margin: 0; }
          .info { display: flex; justify-content: space-between; margin-bottom: 20px; }
          .info-section { width: 45%; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background-color: #E91E63; color: white; }
          .totals { text-align: right; margin-top: 20px; }
          .totals p { margin: 5px 0; }
          .total-amount { font-size: 1.2em; font-weight: bold; color: #E91E63; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Beauty Parlour</h1>
          <p>Invoice</p>
        </div>
        <div class="info">
          <div class="info-section">
            <h3>Bill To:</h3>
            <p>${invoice.customer.name}</p>
            <p>${invoice.customer.email}</p>
            <p>${invoice.customer.phone}</p>
          </div>
          <div class="info-section">
            <h3>Invoice Details:</h3>
            <p>Invoice #: ${invoice.invoiceNumber}</p>
            <p>Date: ${new Date(invoice.issuedDate).toLocaleDateString()}</p>
            <p>Status: ${invoice.paymentStatus.toUpperCase()}</p>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        <div class="totals">
          <p>Subtotal: ₹${invoice.subtotal.toFixed(2)}</p>
          <p>Tax: ₹${invoice.tax.toFixed(2)}</p>
          ${invoice.discount > 0 ? `<p>Discount: -₹${invoice.discount.toFixed(2)}</p>` : ''}
          <p class="total-amount">Total: ₹${invoice.total.toFixed(2)}</p>
        </div>
      </body>
      </html>
    `;
  }
}
