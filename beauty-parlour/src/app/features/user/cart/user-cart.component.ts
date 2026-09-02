import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CartService, CartItem } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { WhatsAppService } from '../../../core/services/whatsapp.service';

@Component({
  selector: 'app-user-cart',
  standalone: true,
  imports: [
    CommonModule, DecimalPipe, RouterLink, FormsModule, ReactiveFormsModule,
    MatIconModule, MatButtonModule, MatSnackBarModule, MatProgressSpinnerModule
  ],
  templateUrl: './user-cart.component.html',
  styleUrl: './user-cart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserCartComponent implements OnInit {
  checkoutForm: FormGroup;
  couponCode = '';
  appliedCoupon: { code: string; discountPercent: number; discountAmount: number } | null = null;
  redeemPoints = false;
  pointsDiscount = 0;
  userPoints = 650;
  
  deliveryMethod: 'standard' | 'express' = 'standard';
  paymentMethod: 'upi' | 'card' | 'cod' = 'upi';

  isProcessing = false;
  orderPlaced = false;
  confirmedOrder: any = null;

  constructor(
    public cartService: CartService,
    private authService: AuthService,
    private whatsAppService: WhatsAppService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    const user = this.authService.getCurrentUser();
    this.checkoutForm = this.fb.group({
      fullName: [user?.name || '', Validators.required],
      phone: [user?.phone || '', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      email: [user?.email || ''],
      streetAddress: ['', Validators.required],
      city: ['Hyderabad', Validators.required],
      state: ['Telangana', Validators.required],
      pincode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      orderNotes: ['']
    });
  }

  ngOnInit(): void {}

  applyCoupon(): void {
    const code = (this.couponCode || '').trim().toUpperCase();
    if (!code) return;

    if (code === 'GLOW15' || code === 'TINORE15') {
      this.appliedCoupon = { code, discountPercent: 15, discountAmount: 0 };
      this.snackBar.open('🎉 Coupon GLOW15 applied! 15% discount activated.', 'OK', { duration: 3000, panelClass: ['success-snackbar'] });
    } else if (code === 'WELCOME20') {
      this.appliedCoupon = { code, discountPercent: 20, discountAmount: 0 };
      this.snackBar.open('✨ Coupon WELCOME20 applied! 20% discount activated.', 'OK', { duration: 3000, panelClass: ['success-snackbar'] });
    } else if (code === 'FREESHIP') {
      this.appliedCoupon = { code, discountPercent: 0, discountAmount: 99 };
      this.snackBar.open('🚚 FREE shipping promo applied!', 'OK', { duration: 3000, panelClass: ['success-snackbar'] });
    } else {
      this.snackBar.open('Invalid coupon code. Try GLOW15 or WELCOME20', 'OK', { duration: 3000, panelClass: ['error-snackbar'] });
    }
    this.cdr.markForCheck();
  }

  removeCoupon(): void {
    this.appliedCoupon = null;
    this.couponCode = '';
    this.cdr.markForCheck();
  }

  togglePointsRedemption(): void {
    this.redeemPoints = !this.redeemPoints;
    this.pointsDiscount = this.redeemPoints ? Math.min(150, Math.floor(this.userPoints / 5)) : 0;
    this.cdr.markForCheck();
  }

  getCalculatedTotal(subtotal: number): { subtotal: number; discount: number; shipping: number; total: number } {
    let discount = 0;
    if (this.appliedCoupon) {
      if (this.appliedCoupon.discountPercent > 0) {
        discount += Math.round((subtotal * this.appliedCoupon.discountPercent) / 100);
      } else {
        discount += this.appliedCoupon.discountAmount;
      }
    }
    if (this.redeemPoints) {
      discount += this.pointsDiscount;
    }

    const shipping = subtotal >= 999 || this.deliveryMethod === 'standard' ? 0 : 99;
    const expressFee = this.deliveryMethod === 'express' ? 149 : 0;
    const total = Math.max(0, subtotal - discount + shipping + expressFee);

    return { subtotal, discount, shipping: shipping + expressFee, total };
  }

  processOrder(items: CartItem[], subtotal: number): void {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      this.snackBar.open('Please fill out all required shipping address fields.', 'OK', { duration: 3000, panelClass: ['error-snackbar'] });
      return;
    }

    this.isProcessing = true;
    this.cdr.markForCheck();

    const calculation = this.getCalculatedTotal(subtotal);
    const formVal = this.checkoutForm.value;
    const orderNum = 'SM-' + Math.floor(100000 + Math.random() * 900000);

    // 1. Send Order via WhatsApp
    this.whatsAppService.sendCartOrder({
      customerName: formVal.fullName,
      phone: formVal.phone,
      email: formVal.email,
      address: formVal.streetAddress,
      city: formVal.city,
      state: formVal.state,
      pincode: formVal.pincode,
      items: items,
      subtotal: calculation.subtotal,
      discount: calculation.discount,
      deliveryFee: calculation.shipping,
      total: calculation.total,
      couponCode: this.appliedCoupon?.code,
      paymentMethod: this.paymentMethod,
      notes: formVal.orderNotes
    });

    setTimeout(() => {
      this.confirmedOrder = {
        orderId: orderNum,
        items: [...items],
        calculation,
        shippingDetails: this.checkoutForm.value,
        paymentMethod: this.paymentMethod,
        orderDate: new Date(),
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      };

      this.cartService.clearCart();
      this.isProcessing = false;
      this.orderPlaced = true;
      this.cdr.markForCheck();

      this.snackBar.open('✨ Opening WhatsApp with your order details...', 'OK', {
        duration: 5000,
        panelClass: ['success-snackbar']
      });
    }, 600);
  }
}
