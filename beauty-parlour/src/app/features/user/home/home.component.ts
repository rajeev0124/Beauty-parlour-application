import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { forkJoin } from 'rxjs';
import { SkinQuizComponent } from '../../../shared/components/skin-quiz/skin-quiz.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, SkinQuizComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  @ViewChild('skinQuiz') skinQuiz!: SkinQuizComponent;
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

  // Tinore Skincare 3-Step Routine
  skincareSteps = [
    {
      step: '01',
      title: 'Gentle Botanical Cleanser',
      subtitle: 'Purify & Balance',
      desc: 'Formulated with calendula and green tea to dissolve impurities while preserving natural skin lipid barrier.',
      icon: 'star',
      time: 'Step 1 • Morning & Night',
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&h=700&fit=crop'
    },
    {
      step: '02',
      title: 'Revitalizing Niacinamide Tonic',
      subtitle: 'Tone & Refine Pores',
      desc: 'Restores skin pH, minimizes texture, and infuses active botanical antioxidants for immediate luminous radiance.',
      icon: 'spa',
      time: 'Step 2 • Morning & Night',
      image: 'https://images.unsplash.com/photo-1608248597359-07304f58b094?w=600&h=700&fit=crop'
    },
    {
      step: '03',
      title: 'Deep Bio-Ceramide Hydrator',
      subtitle: 'Hydrate & Seal Glow',
      desc: 'A velvety ultra-nourishing cream packed with hyaluronic acid and phyto-ceramides for 48H continuous hydration.',
      icon: 'spa',
      time: 'Step 3 • Night Repair',
      image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&h=700&fit=crop'
    }
  ];

  // Active Key Ingredients
  ingredients = [
    { name: 'Multi-Depth Hyaluronic Acid', desc: 'Draws moisture 1000x its weight into dermal layers for plump, dewy skin.', tag: 'Team', icon: 'opacity' },
    { name: 'Pure Botanical Vitamin C', desc: 'Neutralizes free radicals, boosts collagen synthesis and fades dark spots.', tag: 'Radiance', icon: 'favorite' },
    { name: 'Niacinamide 5% + Zinc', desc: 'Refines enlarged pores, regulates sebum, and smooths skin irregularities.', tag: 'Clarity', icon: 'auto_awesome' },
    { name: 'Organic Cold-Pressed Rosehip', desc: 'Rich in essential omegas 3, 6 & 9 to accelerate nighttime cellular rejuvenation.', tag: 'Anti-Aging', icon: 'local_florist' }
  ];

  // Category Tabs
  categories = ['All Experiences', 'Skin & Facials', 'Hair Design', 'Body & Spa', 'Bridal'];
  selectedCategory = 'All Experiences';

  // Active routine step tab index
  activeRoutineStep = 0;

  // Before & After Interactive Transformations
  transformations = [
    {
      id: 'bridal',
      title: 'Royal Bridal Glow & Artistry',
      category: 'Bridal Couture',
      description: 'Custom HD bridal skin prep, airbrush radiant finish, and bespoke traditional hair adornment.',
      beforeImg: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&q=80',
      afterImg: 'https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=900&q=80',
      duration: '3.5 Hours',
      artist: 'Lead Master Stylist',
      serviceName: 'Bridal Makeup'
    },
    {
      id: 'facial',
      title: 'Hydra-Infusion Glass Skin Revival',
      category: 'Clinical Skin',
      description: 'Ultrasonic deep pore extraction, active hyaluronic oxygen infusion, and bio-lipid recovery.',
      beforeImg: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=900&q=80',
      afterImg: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=900&q=80',
      duration: '75 Minutes',
      artist: 'Senior Aesthetician',
      serviceName: 'Skin Care'
    },
    {
      id: 'hair',
      title: 'Keratin Silk Smooth & Gloss Balayage',
      category: 'Hair Artistry',
      description: 'Deep bond restructuring, frizz elimination, and high-shine dimensional honey gloss.',
      beforeImg: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=900&q=80',
      afterImg: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=900&q=80',
      duration: '2.5 Hours',
      artist: 'Creative Hair Director',
      serviceName: 'Hair Styling'
    }
  ];
  activeTransformationIndex = 0;
  sliderPosition = 50; // percentage for split reveal

  get currentTransformation() {
    return this.transformations[this.activeTransformationIndex];
  }

  onSliderInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.sliderPosition = Number(target.value);
    this.cdr.markForCheck();
  }

  setTransformation(index: number): void {
    this.activeTransformationIndex = index;
    this.sliderPosition = 50;
    this.cdr.markForCheck();
  }
  
  // Loading state for dynamic content
  loadingDynamic = true;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    // Load dynamic content in parallel
    this.loadDynamicContent();
  }

  setCategory(cat: string) {
    this.selectedCategory = cat;
  }

  setRoutineStep(idx: number) {
    this.activeRoutineStep = idx;
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
