import { Component, OnInit, inject, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';

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
    RouterLink
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

  contactInfo = {
    address: '123 Beauty Lane, Fashion District, City - 560001',
    phone: '+91 98765 43210',
    email: 'hello@beautyparlour.com',
    hours: [
      { day: 'Monday - Friday', time: '9:00 AM - 8:00 PM' },
      { day: 'Saturday', time: '9:00 AM - 9:00 PM' },
      { day: 'Sunday', time: '10:00 AM - 6:00 PM' }
    ]
  };

  socialLinks = [
    { name: 'WhatsApp', icon: 'whatsapp', url: 'https://wa.me/919876543210' },
    { name: 'Instagram', icon: 'instagram', url: 'https://instagram.com/beautyparlour' }
  ];

  inquiryTypes = [
    'General Inquiry',
    'Appointment Request',
    'Feedback',
    'Complaint',
    'Partnership',
    'Other'
  ];

  ngOnInit(): void {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^\d{10}$/)]],
      subject: ['General Inquiry', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  submitForm(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.sending = true;
    
    // Simulate API call
    setTimeout(() => {
      this.sending = false;
      this.contactForm.reset({ subject: 'General Inquiry' });
      this.snackBar.open('Message sent successfully! We\'ll get back to you soon.', 'Close', { 
        duration: 5000,
        panelClass: ['success-snackbar']
      });
      this.cdr.detectChanges();
    }, 1500);
  }
}
