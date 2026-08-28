import { Injectable, Logger } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import { ConfigService } from '@nestjs/config';

export interface InvoiceData {
  invoiceNumber: string;
  date: Date;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAddress?: string;
  items: {
    name: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  subtotal: number;
  discount?: number;
  tax?: number;
  total: number;
  paymentMethod?: string;
  paymentStatus: string;
  notes?: string;
}

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);

  constructor(private configService: ConfigService) {}

  async generateInvoicePDF(data: InvoiceData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header with gradient-like effect
        doc.rect(0, 0, doc.page.width, 120).fill('#6C3CE1');

        // Company Logo/Name
        doc.fontSize(28).fillColor('#FFFFFF').text('Beauty Parlour', 50, 40);
        doc.fontSize(10).text('Premium Beauty Care', 50, 75);

        // Invoice label
        doc.fontSize(20).text('INVOICE', doc.page.width - 150, 50, {
          width: 100,
          align: 'right',
        });

        // Reset position
        doc.fillColor('#333333');

        // Invoice details box
        const detailsY = 150;
        doc.fontSize(10);

        // Left side - Bill To
        doc.font('Helvetica-Bold').text('Bill To:', 50, detailsY);
        doc
          .font('Helvetica')
          .text(data.customerName, 50, detailsY + 15)
          .text(data.customerEmail, 50, detailsY + 30);
        if (data.customerPhone) {
          doc.text(data.customerPhone, 50, detailsY + 45);
        }
        if (data.customerAddress) {
          doc.text(data.customerAddress, 50, detailsY + 60, { width: 200 });
        }

        // Right side - Invoice Info
        const rightX = doc.page.width - 200;
        doc.font('Helvetica-Bold').text('Invoice Number:', rightX, detailsY);
        doc.font('Helvetica').text(data.invoiceNumber, rightX + 100, detailsY);

        doc.font('Helvetica-Bold').text('Date:', rightX, detailsY + 15);
        doc
          .font('Helvetica')
          .text(
            new Date(data.date).toLocaleDateString('en-IN'),
            rightX + 100,
            detailsY + 15,
          );

        doc.font('Helvetica-Bold').text('Status:', rightX, detailsY + 30);
        doc
          .font('Helvetica')
          .fillColor(data.paymentStatus === 'paid' ? '#22C55E' : '#EF4444')
          .text(data.paymentStatus.toUpperCase(), rightX + 100, detailsY + 30);
        doc.fillColor('#333333');

        // Items table
        const tableTop = 270;
        const tableHeaders = [
          'Item',
          'Description',
          'Qty',
          'Unit Price',
          'Total',
        ];
        const colWidths = [150, 150, 50, 80, 80];

        // Table header
        doc.rect(50, tableTop - 5, doc.page.width - 100, 25).fill('#F3F4F6');
        doc.fillColor('#333333').font('Helvetica-Bold').fontSize(10);

        let xPos = 55;
        tableHeaders.forEach((header, i) => {
          doc.text(header, xPos, tableTop + 3, {
            width: colWidths[i],
            align: i > 1 ? 'right' : 'left',
          });
          xPos += colWidths[i];
        });

        // Table rows
        doc.font('Helvetica').fontSize(9);
        let yPos = tableTop + 30;

        data.items.forEach((item, index) => {
          if (index % 2 === 0) {
            doc.rect(50, yPos - 5, doc.page.width - 100, 25).fill('#FAFAFA');
            doc.fillColor('#333333');
          }

          xPos = 55;
          doc.text(item.name, xPos, yPos, { width: colWidths[0] });
          xPos += colWidths[0];
          doc.text(item.description || '-', xPos, yPos, {
            width: colWidths[1],
          });
          xPos += colWidths[1];
          doc.text(item.quantity.toString(), xPos, yPos, {
            width: colWidths[2],
            align: 'right',
          });
          xPos += colWidths[2];
          doc.text(`₹${item.unitPrice.toFixed(2)}`, xPos, yPos, {
            width: colWidths[3],
            align: 'right',
          });
          xPos += colWidths[3];
          doc.text(`₹${item.total.toFixed(2)}`, xPos, yPos, {
            width: colWidths[4],
            align: 'right',
          });

          yPos += 25;
        });

        // Totals section
        const totalsX = doc.page.width - 200;
        yPos += 20;

        doc
          .moveTo(totalsX - 20, yPos - 10)
          .lineTo(doc.page.width - 50, yPos - 10)
          .stroke('#E5E7EB');

        doc.font('Helvetica').fontSize(10);
        doc.text('Subtotal:', totalsX, yPos);
        doc.text(`₹${data.subtotal.toFixed(2)}`, totalsX + 80, yPos, {
          width: 70,
          align: 'right',
        });

        if (data.discount && data.discount > 0) {
          yPos += 20;
          doc.fillColor('#22C55E').text('Discount:', totalsX, yPos);
          doc.text(`-₹${data.discount.toFixed(2)}`, totalsX + 80, yPos, {
            width: 70,
            align: 'right',
          });
          doc.fillColor('#333333');
        }

        if (data.tax && data.tax > 0) {
          yPos += 20;
          doc.text('Tax (GST):', totalsX, yPos);
          doc.text(`₹${data.tax.toFixed(2)}`, totalsX + 80, yPos, {
            width: 70,
            align: 'right',
          });
        }

        yPos += 25;
        doc
          .moveTo(totalsX - 20, yPos - 5)
          .lineTo(doc.page.width - 50, yPos - 5)
          .stroke('#333333');

        doc.font('Helvetica-Bold').fontSize(12);
        doc.text('Total:', totalsX, yPos);
        doc.text(`₹${data.total.toFixed(2)}`, totalsX + 80, yPos, {
          width: 70,
          align: 'right',
        });

        // Payment method
        if (data.paymentMethod) {
          yPos += 30;
          doc.font('Helvetica').fontSize(10);
          doc.text(`Payment Method: ${data.paymentMethod}`, totalsX, yPos);
        }

        // Notes
        if (data.notes) {
          yPos += 50;
          doc.font('Helvetica-Bold').fontSize(10).text('Notes:', 50, yPos);
          doc
            .font('Helvetica')
            .fontSize(9)
            .text(data.notes, 50, yPos + 15, { width: 300 });
        }

        // Footer
        const footerY = doc.page.height - 80;
        doc
          .moveTo(50, footerY)
          .lineTo(doc.page.width - 50, footerY)
          .stroke('#E5E7EB');

        doc.fontSize(8).fillColor('#666666');
        doc.text('Thank you for choosing Beauty Parlour!', 50, footerY + 15, {
          align: 'center',
          width: doc.page.width - 100,
        });
        doc.text(
          '123 Beauty Lane, Fashion District, City - 560001 | +91 98765 43210 | hello@beautyparlour.com',
          50,
          footerY + 30,
          { align: 'center', width: doc.page.width - 100 },
        );

        doc.end();
      } catch (error) {
        this.logger.error(
          `Failed to generate invoice PDF: ${(error as Error).message}`,
        );
        reject(new Error((error as Error).message || 'Failed to generate PDF'));
      }
    });
  }

  generateInvoiceNumber(): string {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `INV-${year}${month}-${random}`;
  }
}
