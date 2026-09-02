import { Component, OnInit, AfterViewInit, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ServiceService } from '../../../core/services/service.service';
import { StaffService } from '../../../core/services/staff.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AuthService } from '../../../core/services/auth.service';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { WhatsAppService } from '../../../core/services/whatsapp.service';
import { Service } from '../../../core/models/service.model';
import { Staff } from '../../../core/models/staff.model';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-book-appointment',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink, DatePipe, DecimalPipe,
    MatIconModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatDatepickerModule, MatNativeDateModule,
    MatButtonModule, MatSnackBarModule, MatProgressSpinnerModule
  ],
  templateUrl: './book-appointment.component.html',
  styleUrl: './book-appointment.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class BookAppointmentComponent implements OnInit, AfterViewInit {
  step = 1;
  bookingForm: FormGroup;
  submitted = false;
  submitting = false;
  loadingData = true;
  isLoggedIn = false;

  services: Service[] = [];
  stylists: Staff[] = [];
  allProducts: Product[] = [];
  recommendedProducts: Product[] = [];

  timeSlots = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
    '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM',
    '7:00 PM', '7:30 PM', '8:00 PM'
  ];

  // Set minDate to start of today (midnight) to avoid time-based change detection issues
  minDate: Date;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    private serviceService: ServiceService,
    private staffService: StaffService,
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private productService: ProductService,
    public cartService: CartService,
    private whatsAppService: WhatsAppService,
    private cdr: ChangeDetectorRef,
    private el: ElementRef
  ) {
    const today = new Date();
    this.minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    this.isLoggedIn = this.authService.isLoggedIn();
    const user = this.authService.getCurrentUser();
    this.bookingForm = this.fb.group({
      service: ['', Validators.required],
      stylist: [''],
      date: ['', Validators.required],
      time: ['', Validators.required],
      name: [user?.name || '', Validators.required],
      phone: [user?.phone || '', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      email: [user?.email || '', [Validators.required, Validators.email]],
      notes: [''],
    });

    // Listen to service changes to update product recommendations
    this.bookingForm.get('service')?.valueChanges.subscribe(() => {
      this.updateRecommendedProducts();
    });
  }

  ngOnInit(): void {
    this.serviceService.getAll().subscribe({
      next: (services) => {
        this.services = services;
        this.loadingData = false;
        this.checkQueryParamService();
        this.cdr.markForCheck();
      },
      error: () => {
        this.loadingData = false;
        this.cdr.markForCheck();
      }
    });

    this.staffService.getAll().subscribe({
      next: (staff) => {
        this.stylists = staff;
        this.cdr.markForCheck();
      }
    });

    this.productService.getAll().subscribe({
      next: (products) => {
        this.allProducts = products;
        this.updateRecommendedProducts();
        this.cdr.markForCheck();
      }
    });
  }

  ngAfterViewInit(): void {
    if (typeof window !== 'undefined') {
      requestAnimationFrame(() => {
        const targets = this.el.nativeElement.querySelectorAll('.anim-3d');
        targets.forEach((el: Element) => el.classList.add('anim-visible'));
      });
    }
  }

  private checkQueryParamService(): void {
    const serviceParam = this.route.snapshot.queryParams['service'];
    if (serviceParam && this.services.length > 0) {
      const match = this.services.find(s => 
        s._id === serviceParam || 
        s.name.toLowerCase() === serviceParam.toLowerCase() ||
        s.name.toLowerCase().includes(serviceParam.toLowerCase())
      );
      if (match) {
        this.bookingForm.patchValue({ service: match.name });
      }
    }
  }

  get selectedService(): Service | undefined {
    return this.services.find(s => s.name === this.bookingForm.get('service')?.value);
  }

  get selectedStylist(): Staff | undefined {
    return this.stylists.find(s => s.name === this.bookingForm.get('stylist')?.value);
  }

  quickNotes = [
    'Sensitive Skin',
    'Quiet Session Preferred',
    'Fragrance Allergy',
    'Special Occasion / Bridal'
  ];

  addQuickNote(tag: string): void {
    const current = this.bookingForm.get('notes')?.value || '';
    if (current.includes(tag)) return;
    const updated = current ? `${current}, ${tag}` : tag;
    this.bookingForm.patchValue({ notes: updated });
    this.cdr.markForCheck();
  }

  updateRecommendedProducts(): void {
    const svc = this.selectedService;
    if (!svc || !this.allProducts.length) {
      this.recommendedProducts = this.allProducts.slice(0, 3);
      this.cdr.markForCheck();
      return;
    }

    const svcCategory = (svc.category || '').toLowerCase();
    const svcName = (svc.name || '').toLowerCase();

    // Smart matching based on service keyword
    let matches: Product[] = [];
    if (svcCategory.includes('facial') || svcCategory.includes('skin') || svcName.includes('glow') || svcName.includes('facial')) {
      matches = this.allProducts.filter(p => p.category === 'skincare' || p.category === 'skin' || p.category === 'serums');
    } else if (svcCategory.includes('hair') || svcName.includes('hair') || svcName.includes('conditioning') || svcName.includes('keratin')) {
      matches = this.allProducts.filter(p => p.category === 'haircare' || p.category === 'hair');
    } else if (svcCategory.includes('makeup') || svcCategory.includes('bridal')) {
      matches = this.allProducts.filter(p => p.category === 'makeup' || p.category === 'tools');
    }

    if (matches.length < 3) {
      matches = [...matches, ...this.allProducts.filter(p => !matches.includes(p))];
    }

    this.recommendedProducts = matches.slice(0, 3);
    this.cdr.markForCheck();
  }

  addCareProduct(product: Product): void {
    this.cartService.addItem(product, 1);
    this.snackBar.open(`🛍️ Added ${product.name} to your Beauty Bag!`, 'View Bag', {
      duration: 3000,
      panelClass: ['success-snackbar']
    }).onAction().subscribe(() => {
      this.cartService.openDrawer();
    });
  }

  nextStep(): void {
    if (this.step === 1) {
      if (this.bookingForm.get('service')?.valid && this.bookingForm.get('date')?.valid && this.bookingForm.get('time')?.valid) {
        this.step = 2;
        this.cdr.markForCheck();
      }
    }
  }

  prevStep(): void {
    this.step = 1;
    this.cdr.markForCheck();
  }

  submit(): void {
    if (this.bookingForm.invalid) return;

    this.submitting = true;
    this.cdr.markForCheck();
    
    const formVal = this.bookingForm.value;
    const selectedSvc = this.selectedService;
    const selectedStaff = this.stylists.find(s => s.name === formVal.stylist);

    // Format date string
    const dateObj = new Date(formVal.date);
    const formattedDate = `${dateObj.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}`;

    // 1. Send via WhatsApp Integration
    this.whatsAppService.sendAppointmentBooking({
      customerName: formVal.name,
      phone: formVal.phone,
      email: formVal.email,
      serviceName: selectedSvc?.name || formVal.service,
      price: selectedSvc?.price,
      duration: selectedSvc?.duration,
      date: formattedDate,
      time: formVal.time,
      stylistName: selectedStaff?.name || formVal.stylist || undefined,
      notes: formVal.notes || undefined
    });

    // 2. Also register in local memory
    this.appointmentService.create({
      userName: formVal.name,
      serviceName: selectedSvc?.name || formVal.service,
      serviceId: selectedSvc?._id || 's1',
      date: dateObj.toISOString(),
      time: formVal.time,
      staffName: selectedStaff?.name,
      notes: formVal.notes
    }).subscribe();

    setTimeout(() => {
      this.submitting = false;
      this.submitted = true;
      this.cdr.markForCheck();
      this.snackBar.open('✨ Opening WhatsApp to confirm your appointment...', 'OK', { 
        duration: 5000,
        panelClass: ['success-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
    }, 100);
  }

  resendToWhatsApp(): void {
    const formVal = this.bookingForm.value;
    const selectedSvc = this.selectedService;
    const selectedStaff = this.stylists.find(s => s.name === formVal.stylist);
    const dateObj = new Date(formVal.date);
    const formattedDate = `${dateObj.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}`;

    this.whatsAppService.sendAppointmentBooking({
      customerName: formVal.name,
      phone: formVal.phone,
      email: formVal.email,
      serviceName: selectedSvc?.name || formVal.service,
      price: selectedSvc?.price,
      duration: selectedSvc?.duration,
      date: formattedDate,
      time: formVal.time,
      stylistName: selectedStaff?.name || formVal.stylist || undefined,
      notes: formVal.notes || undefined
    });
  }

  bookAnother(): void {
    this.submitted = false;
    this.step = 1;
    this.bookingForm.reset();
    const user = this.authService.getCurrentUser();
    if (user) {
      this.bookingForm.patchValue({ name: user.name, phone: user.phone, email: user.email });
    }
    this.cdr.markForCheck();
  }
}
