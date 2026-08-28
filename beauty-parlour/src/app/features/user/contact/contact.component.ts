import { Component, OnInit, inject, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { LineMaskSplitComponent } from '../../../shared/components/line-mask-split/line-mask-split.component';

export interface ConciergeChannel {
  id: string;
  icon: string;
  title: string;
  value: string;
  actionLabel: string;
  actionLink: string;
  isExternal?: boolean;
  subtext: string;
  badge?: string;
}

export interface AmenityItem {
  icon: string;
  label: string;
  desc: string;
}

export interface ContactFaq {
  q: string;
  a: string;
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
    MatProgressSpinnerModule,
    RouterLink,
    LineMaskSplitComponent
  ],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent implements OnInit, AfterViewInit {
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  contactForm!: FormGroup;
  sending = false;
  openFaqIndex: number | null = 0;

  channels: ConciergeChannel[] = [
    {
      id: 'phone',
      icon: 'call',
      title: 'Studio Hotline & Desk',
      value: '+91 98765 43210',
      actionLabel: 'Call Directly',
      actionLink: 'tel:+919876543210',
      subtext: 'Instant reservations & urgent inquiries',
      badge: 'Available 9AM–8:30PM'
    },
    {
      id: 'whatsapp',
      icon: 'chat',
      title: 'WhatsApp Concierge',
      value: '+91 98765 43210',
      actionLabel: 'Chat on WhatsApp',
      actionLink: 'https://wa.me/919876543210?text=Hello%20Sindhura%20Makeovers%20Concierge%2C%20I%20would%20like%20to%20inquire%20about%20a%20booking.',
      isExternal: true,
      subtext: 'Fastest bridal portfolio & pricing lookbook',
      badge: 'Instant Replies'
    },
    {
      id: 'email',
      icon: 'mail',
      title: 'Official Studio Email',
      value: 'concierge@sindhuramakeovers.com',
      actionLabel: 'Send an Email',
      actionLink: 'mailto:concierge@sindhuramakeovers.com',
      subtext: 'Detailed bridal RFPs, PR & collaborations',
      badge: '< 2 Hr Response'
    },
    {
      id: 'location',
      icon: 'location_on',
      title: 'Flagship Studio Suite',
      value: '123 Beauty Boulevard, Luxury Galleria, 4th Floor',
      actionLabel: 'Get Map Directions',
      actionLink: 'https://maps.google.com/?q=123+Beauty+Boulevard+Luxury+Galleria',
      isExternal: true,
      subtext: 'Valet parking at Galleria Main Gate',
      badge: 'Central Landmark'
    }
  ];

  amenities: AmenityItem[] = [
    { icon: 'local_parking', label: 'Valet Parking', desc: 'Dedicated concierge parking at Main Gate' },
    { icon: 'dry_cleaning', label: 'Private VIP Suites', desc: 'Soundproof chambers with cinema vanity lighting' },
    { icon: 'local_cafe', label: 'Beverage Bar', desc: 'Artisanal espresso, matcha & organic floral teas' },
    { icon: 'wifi', label: 'High-Speed Wi-Fi', desc: 'Ultra-fast guest connectivity & device chargers' }
  ];

  scheduleHours = [
    { days: 'Monday – Friday', time: '9:00 AM – 8:30 PM', isPeak: false },
    { days: 'Saturday', time: '9:00 AM – 9:00 PM', isPeak: true },
    { days: 'Sunday', time: '10:00 AM – 7:00 PM', isPeak: true }
  ];

  inquirySubjects = [
    { label: 'Bridal Makeover & Trials', value: 'Bridal Makeover & Trials' },
    { label: 'Clinical Facial / Dermatological Care', value: 'Clinical Facial & Dermatology' },
    { label: 'Hair Botoplex / Restructure & Color', value: 'Hair Restructure & Color' },
    { label: 'Party & Celebrity Styling', value: 'Party & Celebrity Styling' },
    { label: 'General Studio Inquiry / Custom Package', value: 'General Studio Inquiry' }
  ];

  faqs: ContactFaq[] = [
    {
      q: 'Do I need to book an appointment, or do you accept walk-ins?',
      a: 'We warmly welcome walk-ins for express hair styling, threading, and standard manicures subject to availability. However, for bridal trials, clinical facials, and advanced hair rituals, we strongly recommend reserving your slot in advance to guarantee your private chamber.'
    },
    {
      q: 'What is the standard cancellation and rescheduling policy?',
      a: 'Appointments can be rescheduled or cancelled with zero fee up to 24 hours prior to the scheduled start time. For dedicated bridal package bookings, please provide at least 72 hours notice.'
    },
    {
      q: 'Is there parking available at the flagship studio?',
      a: 'Yes, complimentary valet parking is provided for all our patrons directly at the Luxury Galleria main entrance portico.'
    },
    {
      q: 'Can the team travel for destination weddings and venue makeovers?',
      a: 'Yes! Our On-Location Bridal Vanity Team travels globally with high-CRI cinema lighting kits and custom vanity stations. Reach out via WhatsApp or our inquiry form for destination quotes.'
    }
  ];

  ngOnInit(): void {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9+ ]{10,14}$/)]],
      subject: ['Bridal Makeover & Trials', Validators.required],
      preferredDate: [''],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  selectSubject(subjectValue: string): void {
    this.contactForm.patchValue({ subject: subjectValue });
  }

  toggleFaq(index: number): void {
    this.openFaqIndex = this.openFaqIndex === index ? null : index;
  }

  submitForm(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.sending = true;
    
    setTimeout(() => {
      this.sending = false;
      this.contactForm.reset({ subject: 'Bridal Makeover & Trials' });
      this.snackBar.open('Thank you! Your message has been routed to our Studio Concierge. We will contact you within 2 hours.', 'Close', { 
        duration: 5000,
        panelClass: ['luxury-snackbar']
      });
      this.cdr.detectChanges();
    }, 1200);
  }
}
