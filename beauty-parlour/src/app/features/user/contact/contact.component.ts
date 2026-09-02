import { Component, OnInit, inject, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { WhatsAppService } from '../../../core/services/whatsapp.service';

export interface ContactFaq {
  q: string;
  a: string;
  open: boolean;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent implements OnInit, AfterViewInit {
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);
  public whatsAppService = inject(WhatsAppService);

  contactForm!: FormGroup;
  sending = false;

  get whatsAppNumber(): string {
    return this.whatsAppService.getWhatsAppNumber();
  }

  get whatsAppLink(): string {
    const msg = encodeURIComponent('Hello Sindhura Makeovers! I would like to inquire about your services.');
    return `https://wa.me/${this.whatsAppNumber}?text=${msg}`;
  }

  // 4 Social / Contact Widgets
  widgets = [
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      handle: '+91 98765 43210',
      desc: 'Chat instantly with our studio team',
      badge: 'Instant Reply',
      badgeColor: '#25D366',
      link: `https://wa.me/919876543210?text=Hello%20Sindhura%20Makeovers!%20I%20would%20like%20to%20inquire.`,
      external: true,
      gradient: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
      iconType: 'whatsapp'
    },
    {
      id: 'instagram',
      label: 'Instagram',
      handle: '@sindhura_makeovers',
      desc: 'Follow our bridal transformations',
      badge: '10K+ Community',
      badgeColor: '#E1306C',
      link: 'https://www.instagram.com/sindhura_makeovers/?hl=en',
      external: true,
      gradient: 'linear-gradient(135deg, #F58529 0%, #DD2A7B 50%, #8134AF 100%)',
      iconType: 'instagram'
    },
    {
      id: 'email',
      label: 'Email Us',
      handle: 'concierge@sindhuramakeovers.com',
      desc: 'For bridal packages & editorial inquiries',
      badge: '< 2 Hr Response',
      badgeColor: '#C9748A',
      link: 'mailto:concierge@sindhuramakeovers.com',
      external: false,
      gradient: 'linear-gradient(135deg, #C9748A 0%, #9A4860 100%)',
      iconType: 'email'
    },
    {
      id: 'phone',
      label: 'Call Us',
      handle: '+91 98765 43210',
      desc: 'Available 9:00 AM – 8:30 PM daily',
      badge: 'Mon–Sun',
      badgeColor: '#6366F1',
      link: 'tel:+919876543210',
      external: false,
      gradient: 'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)',
      iconType: 'phone'
    }
  ];

  scheduleHours = [
    { days: 'Monday – Friday', time: '9:00 AM – 8:30 PM', open: true },
    { days: 'Saturday', time: '9:00 AM – 9:00 PM', open: true },
    { days: 'Sunday', time: '10:00 AM – 7:00 PM', open: true }
  ];

  inquiryTypes = [
    { label: 'Bridal Makeover & Trials', value: 'Bridal Makeover & Trials' },
    { label: 'Hair Treatment & Color', value: 'Hair Treatment & Color' },
    { label: 'Facial & Clinical Skin Care', value: 'Facial & Clinical Skin Care' },
    { label: 'Party & Event Styling', value: 'Party & Event Styling' },
    { label: 'Product Purchase', value: 'Product Purchase' },
    { label: 'General Inquiry', value: 'General Inquiry' }
  ];

  faqs: ContactFaq[] = [
    {
      q: 'Do I need to book in advance or can I walk in?',
      a: 'Walk-ins are warmly welcomed for express grooming, haircuts, and blowouts. For bridal trials, clinical skin therapies, and advanced hair rituals, we recommend booking in advance to reserve your private suite and preferred master artist.',
      open: true
    },
    {
      q: 'What is your cancellation and rescheduling policy?',
      a: 'You may reschedule or cancel your salon appointment with zero fees up to 24 hours prior. For extensive bridal packages, we kindly request a 72-hour advance notice.',
      open: false
    },
    {
      q: 'Is parking available at the studio?',
      a: 'Yes, complimentary valet parking is provided for all patrons directly at the main Luxury Galleria entrance.',
      open: false
    },
    {
      q: 'Do your master artists travel for destination weddings?',
      a: 'Yes, our On-Location Bridal Team travels across India and internationally, equipped with portable cinema lighting and complete vanity kits. Connect with us on WhatsApp for destination itineraries.',
      open: false
    },
    {
      q: 'How quickly do you reply on WhatsApp?',
      a: 'Our concierge team typically replies within minutes during studio hours (9:00 AM – 8:30 PM). The floating chat button connects you directly to our front desk.',
      open: false
    }
  ];

  ngOnInit(): void {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9+ ]{10,14}$/)]],
      inquiryType: ['Bridal Makeover & Trials', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  toggleFaq(index: number): void {
    this.faqs[index].open = !this.faqs[index].open;
  }

  submitForm(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.sending = true;
    const f = this.contactForm.value;

    const msg = [
      '💌 *NEW INQUIRY – SINDHURA MAKEOVERS*',
      '──────────────────────────',
      `👤 *Name:* ${f.name}`,
      `📱 *Phone:* ${f.phone}`,
      `🏷️ *Inquiry:* ${f.inquiryType}`,
      `💬 *Message:* ${f.message}`,
      '──────────────────────────'
    ].join('\n');

    this.whatsAppService.openWhatsApp(msg);

    setTimeout(() => {
      this.sending = false;
      this.contactForm.reset({ inquiryType: 'Bridal Makeover & Trials' });
      this.snackBar.open('✨ Opening WhatsApp with your message...', 'Close', {
        duration: 4000,
        panelClass: ['luxury-snackbar']
      });
      this.cdr.detectChanges();
    }, 400);
  }
}
