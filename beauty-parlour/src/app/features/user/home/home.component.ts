import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  // Static content - displayed immediately
  services = [
    { 
      name: 'Hair Styling', 
      desc: 'Cuts, coloring, treatments & more', 
      icon: 'content_cut', 
      price: '500', 
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
      featured: true,
      color: '#EC4899'
    },
    { 
      name: 'Skin Care', 
      desc: 'Facials, cleanup & glow treatments', 
      icon: 'face_retouching_natural', 
      price: '800',
      image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=300&fit=crop',
      featured: false,
      color: '#8B5CF6'
    },
    { 
      name: 'Nail Art', 
      desc: 'Manicure, pedicure & nail extensions', 
      icon: 'brush', 
      price: '400',
      image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop',
      featured: false,
      color: '#F59E0B'
    },
    { 
      name: 'Massage', 
      desc: 'Full body, head & aromatherapy', 
      icon: 'self_improvement', 
      price: '1,200',
      image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=300&fit=crop',
      featured: true,
      color: '#10B981'
    },
    { 
      name: 'Bridal Makeup', 
      desc: 'Complete bridal packages', 
      icon: 'favorite', 
      price: '15,000',
      image: 'https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=400&h=300&fit=crop',
      featured: true,
      color: '#EF4444'
    },
    { 
      name: 'Hair Removal', 
      desc: 'Waxing, threading & laser', 
      icon: 'auto_awesome', 
      price: '300',
      image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400&h=300&fit=crop',
      featured: false,
      color: '#06B6D4'
    },
  ];

  whyCards = [
    { icon: 'verified', accent: 'purple', title: 'Certified Experts', desc: 'All our stylists are professionally trained and certified with years of experience.' },
    { icon: 'eco', accent: 'blue', title: 'Premium Products', desc: 'We use only top-quality, skin-friendly products from trusted international brands.' },
    { icon: 'schedule', accent: 'amber', title: 'Easy Booking', desc: 'Book your appointment online in seconds. Choose your time, service, and stylist.' },
    { icon: 'payments', accent: 'green', title: 'Affordable Pricing', desc: 'Get premium quality at competitive prices. No hidden charges, ever.' },
  ];

  stats = [
    { value: '10K+', label: 'Happy Clients' },
    { value: '50+', label: 'Expert Stylists' },
    { value: '120+', label: 'Services' },
    { value: '11+', label: 'Years Experience' },
  ];

  // Default fallback reviews - shown immediately
  reviews: any[] = [
    { userName: 'Priya Sharma', comment: 'Amazing experience! The staff is so professional and the results are always perfect.', rating: 5 },
    { userName: 'Meera Nair', comment: 'Love the bridal package! They made me feel so special on my big day.', rating: 5 },
    { userName: 'Anjali Reddy', comment: 'Great ambiance, skilled stylists, and very reasonable pricing.', rating: 4 },
  ];
  reviewStats = { avgRating: 4.8, totalReviews: 250 };

  // Active offers/coupons
  activeCoupons: any[] = [];
  
  // Loading state for dynamic content
  loadingDynamic = true;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    // Load dynamic content in parallel
    this.loadDynamicContent();
  }

  loadDynamicContent() {
    // Use forkJoin to load reviews and coupons in parallel
    forkJoin({
      reviews: this.http.get<any[]>(`${environment.apiUrl}/reviews/public`),
      stats: this.http.get<any>(`${environment.apiUrl}/reviews/stats`),
      coupons: this.http.get<any[]>(`${environment.apiUrl}/coupons/active`)
    }).subscribe({
      next: (data) => {
        if (data.reviews?.length > 0) {
          this.reviews = data.reviews.slice(0, 6);
        }
        if (data.stats) {
          this.reviewStats = data.stats;
        }
        if (data.coupons?.length > 0) {
          this.activeCoupons = data.coupons.slice(0, 3);
        }
        this.loadingDynamic = false;
        this.cdr.markForCheck();
      },
      error: () => {
        // Keep fallback data, just mark loading complete
        this.loadingDynamic = false;
        this.cdr.markForCheck();
      }
    });
  }
}
