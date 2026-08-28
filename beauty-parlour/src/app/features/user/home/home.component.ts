import { Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { forkJoin } from 'rxjs';
import { SkinQuizComponent } from '../../../shared/components/skin-quiz/skin-quiz.component';
import { AutoMovingImageComponent } from '../../../shared/components/auto-moving-image/auto-moving-image.component';
import { FlipButtonComponent } from '../../../shared/components/flip-button/flip-button.component';
import { MechanicalFlipComponent } from '../../../shared/components/mechanical-flip/mechanical-flip.component';
import { RadialRevealButtonComponent } from '../../../shared/components/radial-reveal-button/radial-reveal-button.component';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, SkinQuizComponent, AutoMovingImageComponent, FlipButtonComponent, MechanicalFlipComponent, RadialRevealButtonComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('skinQuiz') skinQuiz!: SkinQuizComponent;
  @ViewChild('glowHeading') glowHeading!: ElementRef<HTMLElement>;
  @ViewChild('transformationHeading') transformationHeading!: ElementRef<HTMLElement>;
  private glowTimeline: any = null;
  // Static content - displayed immediately
  services = [
    { 
      name: 'Hair Styling', 
      desc: 'Cuts, coloring, treatments & more', 
      icon: 'content_cut', 
      price: '500', 
      category: 'Hair Design',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=400&fit=crop&q=80',
      featured: true,
      color: '#EC4899'
    },
    { 
      name: 'Skin & Facial', 
      desc: 'Facials, cleanup & glow treatments', 
      icon: 'face_retouching_natural', 
      price: '800',
      category: 'Skin & Facials',
      image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&h=400&fit=crop&q=80',
      featured: false,
      color: '#8B5CF6'
    },
    { 
      name: 'Nail Art', 
      desc: 'Manicure, pedicure & nail extensions', 
      icon: 'brush', 
      price: '400',
      category: 'Body Care',
      image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&h=400&fit=crop&q=80',
      featured: false,
      color: '#F59E0B'
    },
    { 
      name: 'Advanced Skincare', 
      desc: 'Clinical facials & rejuvenation therapy', 
      icon: 'face_retouching_natural', 
      price: '1,200',
      category: 'Body Care',
      image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=400&fit=crop&q=80',
      featured: true,
      color: '#10B981'
    },
    { 
      name: 'Bridal Makeup', 
      desc: 'Complete bridal packages & trial sessions', 
      icon: 'favorite', 
      price: '15,000',
      category: 'Bridal',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop&q=80',
      featured: true,
      color: '#EF4444'
    },
    { 
      name: 'Bridal Hair & Styling', 
      desc: 'Traditional & modern bridal hair designs', 
      icon: 'auto_awesome', 
      price: '8,000',
      category: 'Bridal',
      image: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=600&h=400&fit=crop&q=80',
      featured: false,
      color: '#D946EF'
    },
    { 
      name: 'Hair Coloring', 
      desc: 'Balayage, highlights & full color services', 
      icon: 'palette', 
      price: '1,500',
      category: 'Hair Design',
      image: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=600&h=400&fit=crop&q=80',
      featured: false,
      color: '#F97316'
    },
    { 
      name: 'Waxing & Threading', 
      desc: 'Smooth skin with expert hair removal', 
      icon: 'auto_awesome', 
      price: '300',
      category: 'Body Care',
      image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&h=400&fit=crop&q=80',
      featured: false,
      color: '#06B6D4'
    },
  ];

  // Computed filtered services based on selected category
  get filteredServices() {
    if (this.selectedCategory === 'All Experiences') {
      return this.services;
    }
    return this.services.filter(s => s.category === this.selectedCategory);
  }

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
      image: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=600&h=700&fit=crop'
    },
    {
      step: '02',
      title: 'Revitalizing Niacinamide Tonic',
      subtitle: 'Tone & Refine Pores',
      desc: 'Restores skin pH, minimizes texture, and infuses active botanical antioxidants for immediate luminous radiance.',
      icon: 'water_drop',
      time: 'Step 2 • Morning & Night',
      image: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?w=600&h=700&fit=crop'
    },
    {
      step: '03',
      title: 'Deep Bio-Ceramide Hydrator',
      subtitle: 'Hydrate & Seal Glow',
      desc: 'A velvety ultra-nourishing cream packed with hyaluronic acid and phyto-ceramides for 48H continuous hydration.',
      icon: 'water_drop',
      time: 'Step 3 • Night Repair',
      image: 'https://images.unsplash.com/photo-1617897903246-719242758050?w=600&h=700&fit=crop'
    }
  ];

  // Active Key Ingredients
  ingredients = [
    { 
      name: 'Multi-Depth Hyaluronic Acid', 
      desc: 'Draws moisture 1000x its weight into dermal layers for plump, dewy skin.', 
      tag: 'Team', 
      icon: 'water_drop',
      color: '#0284C7',
      accentBg: 'rgba(2, 132, 199, 0.08)',
      glow: 'rgba(2, 132, 199, 0.25)',
      stat: '1000x',
      statLabel: 'Hydration Power'
    },
    { 
      name: 'Pure Botanical Vitamin C', 
      desc: 'Neutralizes free radicals, boosts collagen synthesis and fades dark spots.', 
      tag: 'Radiance', 
      icon: 'flare',
      color: '#EA580C',
      accentBg: 'rgba(234, 88, 12, 0.08)',
      glow: 'rgba(234, 88, 12, 0.25)',
      stat: '98%',
      statLabel: 'Antioxidant Shield'
    },
    { 
      name: 'Niacinamide 5% + Zinc', 
      desc: 'Refines enlarged pores, regulates sebum, and smooths skin irregularities.', 
      tag: 'Clarity', 
      icon: 'auto_awesome',
      color: '#7C3AED',
      accentBg: 'rgba(124, 58, 237, 0.08)',
      glow: 'rgba(124, 58, 237, 0.25)',
      stat: '5% Zinc',
      statLabel: 'Pore Refinement'
    },
    { 
      name: 'Organic Cold-Pressed Rosehip', 
      desc: 'Rich in essential omegas 3, 6 & 9 to accelerate nighttime cellular rejuvenation.', 
      tag: 'Anti-Aging', 
      icon: 'local_florist',
      color: '#BE185D',
      accentBg: 'rgba(190, 24, 93, 0.08)',
      glow: 'rgba(190, 24, 93, 0.25)',
      stat: 'Omega 3/6/9',
      statLabel: 'Cellular Renewal'
    }
  ];

  // Category Tabs
  categories = ['All Experiences', 'Skin & Facials', 'Hair Design', 'Body Care', 'Bridal'];
  selectedCategory = 'All Experiences';

  // Active routine step tab index
  activeRoutineStep = 0;
  routineDirection = 1;
  routineRotations = [4, -2, -9, 7];
  // Active routine auto scroll
  private routineInterval: any = null;

  nextRoutineStep(): void {
    this.routineDirection = 1;
    if (this.activeRoutineStep < this.skincareSteps.length - 1) {
      this.activeRoutineStep++;
    } else {
      this.activeRoutineStep = 0; // wrap around
    }
    this.cdr.markForCheck();
  }

  prevRoutineStep(): void {
    this.routineDirection = -1;
    if (this.activeRoutineStep > 0) {
      this.activeRoutineStep--;
    } else {
      this.activeRoutineStep = this.skincareSteps.length - 1; // wrap around
    }
    this.cdr.markForCheck();
  }

  private startRoutineAutoScroll(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    // Clear any existing interval
    this.stopRoutineAutoScroll();
    
    // Auto scroll every 3.5 seconds
    this.routineInterval = setInterval(() => {
      this.nextRoutineStep();
    }, 3500);
  }

  private stopRoutineAutoScroll(): void {
    if (this.routineInterval) {
      clearInterval(this.routineInterval);
      this.routineInterval = null;
    }
  }

  getRoutineCardStyle(index: number) {
    const isActive = index === this.activeRoutineStep;
    const offset = index - this.activeRoutineStep;
    
    // For items that are exiting (behind the active one)
    if (offset < 0) {
      return {
        'transform': `translate3d(${this.routineDirection === 1 ? -250 : 250}px, 0, -260px) rotateZ(${this.routineDirection === 1 ? -10 : 10}deg) scale(0.75)`,
        'opacity': '0',
        'z-index': '0',
        'transition': 'all 0.75s cubic-bezier(0.22, 1, 0.36, 1)',
        'pointer-events': 'none'
      };
    }
    
    // For active item and items in stack
    const absOffset = Math.abs(offset);
    return {
      'transform': `translate3d(${offset * 15}px, ${absOffset * 6}px, ${-150 * absOffset}px) rotateZ(${this.routineRotations[index % 4]}deg) scale(${0.85 - absOffset * 0.04})`,
      'opacity': isActive ? '1' : '0.55',
      'z-index': `${10 - absOffset}`,
      'transition': 'all 0.75s cubic-bezier(0.22, 1, 0.36, 1)'
    };
  }

  // Before & After Interactive Transformations
  transformations = [
    {
      id: 'bridal',
      title: 'Royal Bridal Glow & Artistry',
      category: 'Bridal Couture',
      description: 'Custom HD bridal skin prep, airbrush radiant finish, and bespoke traditional hair adornment.',
      beforeImg: 'bridal-before.jpg',
      afterImg: 'bridal-after.jpg',
      duration: '3.5 Hours',
      artist: 'Lead Master Stylist',
      serviceName: 'Bridal Makeup'
    },
    {
      id: 'facial',
      title: 'Hydra-Infusion Glass Skin Revival',
      category: 'Clinical Skin',
      description: 'Ultrasonic deep pore extraction, active hyaluronic oxygen infusion, and bio-lipid recovery.',
      beforeImg: 'facial-before.jpg',
      afterImg: 'facial-after.jpg',
      duration: '75 Minutes',
      artist: 'Senior Aesthetician',
      serviceName: 'Skin Care'
    },
    {
      id: 'hair',
      title: 'Keratin Silk Smooth & Gloss Balayage',
      category: 'Hair Artistry',
      description: 'Deep bond restructuring, frizz elimination, and high-shine dimensional honey gloss.',
      beforeImg: 'hair-before.jpg',
      afterImg: 'hair-after.jpg',
      duration: '2.5 Hours',
      artist: 'Creative Hair Director',
      serviceName: 'Hair Styling'
    }
  ];

  activeTransformationIndex = 0;
  sliderPosition = 50; // percentage for split reveal
  userInteractingWithSlider = false;

  private sliderRafId: number | null = null;
  private sliderDirection: 1 | -1 = 1; // 1 = moving right (revealing more Before), -1 = moving left
  private sliderResumeTimeout: any = null;
  private isHovered = false;

  get currentTransformation() {
    return this.transformations[this.activeTransformationIndex];
  }

  onSliderInput(event: Event): void {
    this.userInteractingWithSlider = true;
    const target = event.target as HTMLInputElement;
    this.sliderPosition = Number(target.value);
    this.cdr.markForCheck();
    this.scheduleSliderResume();
  }

  onSliderChange(): void {
    this.scheduleSliderResume();
  }

  onComparisonHover(isHovered: boolean): void {
    this.isHovered = isHovered;
    this.userInteractingWithSlider = isHovered;
    if (!isHovered) {
      this.scheduleSliderResume();
    }
  }

  private scheduleSliderResume(): void {
    if (this.sliderResumeTimeout) {
      clearTimeout(this.sliderResumeTimeout);
    }
    // Resume auto-scroll after 3.5s of no user interaction
    this.sliderResumeTimeout = setTimeout(() => {
      if (!this.isHovered) {
        this.userInteractingWithSlider = false;
        this.cdr.markForCheck();
      }
    }, 3500);
  }

  private startAutoSlider(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const minPos = 12; // reveal most of After image
    const maxPos = 88; // reveal most of Before image
    const speed = 0.35; // speed per frame

    const step = () => {
      if (!this.userInteractingWithSlider) {
        let nextPos = this.sliderPosition + this.sliderDirection * speed;

        if (nextPos >= maxPos) {
          nextPos = maxPos;
          this.sliderDirection = -1;
        } else if (nextPos <= minPos) {
          nextPos = minPos;
          this.sliderDirection = 1;
        }

        this.sliderPosition = nextPos;
        this.cdr.markForCheck();
      }

      this.sliderRafId = requestAnimationFrame(step);
    };

    this.sliderRafId = requestAnimationFrame(step);
  }

  private stopAutoSlider(): void {
    if (this.sliderRafId !== null) {
      cancelAnimationFrame(this.sliderRafId);
      this.sliderRafId = null;
    }
    if (this.sliderResumeTimeout) {
      clearTimeout(this.sliderResumeTimeout);
    }
  }

  setTransformation(index: number): void {
    this.activeTransformationIndex = index;
    this.sliderPosition = 50;
    this.cdr.markForCheck();
  }
  
  // Intersection Observer for Scroll Animations
  private gridObserver: IntersectionObserver | null = null;
  
  // Loading state for dynamic content
  loadingDynamic = true;

  constructor(
    private http: HttpClient, 
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    // Load dynamic content in parallel
    this.loadDynamicContent();
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId) && this.glowHeading?.nativeElement) {
      const chars = this.glowHeading.nativeElement.querySelectorAll('.char');
      if (chars.length > 0) {
        // Rolling Letters continuous fast slot animation loop
        this.glowTimeline = gsap.timeline({ repeat: -1, repeatDelay: 0.15 });

        this.glowTimeline
          .fromTo(
            chars,
            { yPercent: 140, opacity: 0 },
            {
              yPercent: 0,
              opacity: 1,
              duration: 0.35,
              ease: 'power4.out',
              stagger: {
                each: 0.03,
                from: 'center'
              }
            }
          )
          .to(
            chars,
            {
              yPercent: -140,
              opacity: 0,
              duration: 0.35,
              ease: 'power4.in',
              stagger: {
                each: 0.03,
                from: 'center'
              }
            },
            '+=0.9'
          );
      }
    }
    this.initTypewriter();
    this.initWhyClientsTypewriter();
    this.initRotatingText();
    this.startAutoSlider();
    this.startRoutineAutoScroll();
    this.initScrollAnimations();

    // Intersection Observer for 3D Shuffle Entrance on Scroll
    if (isPlatformBrowser(this.platformId)) {
      this.gridObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.triggerShuffleAnimation(1.2);
            // Optional: Unobserve if we only want it to happen once
            // this.gridObserver?.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1 // Trigger when 10% of the grid is visible
      });

      // Wait a tick for the view to initialize fully before querying
      setTimeout(() => {
        const grid = document.querySelector('.tinore-services-grid');
        if (grid) {
          this.gridObserver?.observe(grid);
        }
      }, 100);
    }
  }

  ngOnDestroy(): void {
    if (this.glowTimeline) {
      this.glowTimeline.kill();
    }
    this.clearTypewriter();
    this.clearRotatingText();
    this.stopAutoSlider();
    this.stopRoutineAutoScroll();
    
    if (this.gridObserver) {
      this.gridObserver.disconnect();
    }
    
    if (isPlatformBrowser(this.platformId)) {
      ScrollTrigger.getAll().forEach(t => t.kill());
    }
  }

  private initScrollAnimations(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Wait a bit longer for all Angular structural directives to finish rendering
    setTimeout(() => {
      // 1. Marquee Strip
      const marquee = document.querySelector('.marquee-strip');
      if (marquee) {
        gsap.fromTo(marquee, 
          { y: 50, opacity: 0, rotationX: -20 },
          {
            scrollTrigger: { trigger: marquee, start: 'top 90%' },
            y: 0, opacity: 1, rotationX: 0, duration: 1, ease: 'power3.out'
          }
        );
      }

      // 2. 3-Step Routine Showcase Card (Animate the wrapper)
      const routineSection = document.querySelector('.routine-showcase-card');
      if (routineSection) {
        gsap.fromTo(routineSection, 
          { y: 100, opacity: 0, rotationX: -45, scale: 0.9 },
          {
            scrollTrigger: { trigger: '.routine-section', start: 'top 85%' },
            y: 0, opacity: 1, rotationX: 0, scale: 1, duration: 1.2, ease: 'back.out(1.4)', transformOrigin: '50% 100%'
          }
        );
      }

      // 3. Luxe Transformation (Before & After)
      const transformationBlock = document.querySelector('.transformation-stage');
      if (transformationBlock) {
        gsap.fromTo(transformationBlock, 
          { y: 150, opacity: 0, scale: 0.95, rotationY: 10 },
          {
            scrollTrigger: { trigger: '.transformation-section', start: 'top 80%' },
            y: 0, opacity: 1, scale: 1, rotationY: 0, duration: 1.5, ease: 'power4.out'
          }
        );
      }

      // 4. USPs / Ingredients Cards
      const whyCards = gsap.utils.toArray('.ingredient-card');
      if (whyCards.length) {
        gsap.fromTo(whyCards, 
          { y: 80, opacity: 0, rotationX: 30 },
          {
            scrollTrigger: { trigger: '.ingredients-section', start: 'top 85%' },
            y: 0, opacity: 1, rotationX: 0, duration: 1, stagger: 0.15, ease: 'power3.out'
          }
        );
      }

      // Force ScrollTrigger to recalculate positions now that everything is styled and animated
      ScrollTrigger.refresh();
    }, 500);
  }

  // =============================================================
  // 🔄 ROTATING TEXT CAROUSEL ANIMATION (See the Transformation)
  // =============================================================
  rotatingWords = ['Transformation', 'Client Results', 'Radiant Glow'];
  rotatingIndex = 0;
  private rotatingInterval: any = null;

  get currentRotatingChars(): string[] {
    const word = this.rotatingWords[this.rotatingIndex] || 'Transformation';
    return word.split('');
  }

  private initRotatingText(): void {
    if (!isPlatformBrowser(this.platformId) || !this.transformationHeading?.nativeElement) return;

    this.rotatingInterval = setInterval(() => {
      const heading = this.transformationHeading.nativeElement;
      const chars = heading.querySelectorAll('.char');
      if (!chars.length) return;

      gsap.killTweensOf(chars);
      gsap.to(chars, {
        yPercent: -120,
        opacity: 0,
        duration: 0.4,
        stagger: {
          each: 0.03,
          from: 'start'
        },
        ease: 'power2.in',
        onComplete: () => {
          this.rotatingIndex = (this.rotatingIndex + 1) % this.rotatingWords.length;
          this.cdr.detectChanges();

          const newChars = heading.querySelectorAll('.char');
          gsap.fromTo(
            newChars,
            { yPercent: 100, opacity: 0 },
            {
              yPercent: 0,
              opacity: 1,
              duration: 0.4,
              stagger: {
                each: 0.03,
                from: 'start'
              },
              ease: 'power2.out'
            }
          );
        }
      });
    }, 2400);
  }

  private clearRotatingText(): void {
    if (this.rotatingInterval) {
      clearInterval(this.rotatingInterval);
      this.rotatingInterval = null;
    }
  }

  // =============================================================
  // ⌨️ TYPEWRITER / TYPE SEQUENCE ANIMATION
  // =============================================================
  typewriterItems = [
    { main: 'Curated Beauty ', italic: 'Experiences' },
    { main: 'Bespoke Radiance ', italic: 'Rituals' },
    { main: 'Luxury Skin & Hair ', italic: 'Care' }
  ];
  typewriterTextIndex = 0;
  typewriterCharIndex = 0;
  typewriterPhase: 'typing' | 'holding' | 'deleting' = 'typing';
  private typewriterTimeout: any = null;

  get currentTypewriterMain(): string {
    const item = this.typewriterItems[this.typewriterTextIndex];
    return item.main.slice(0, Math.min(this.typewriterCharIndex, item.main.length));
  }

  get currentTypewriterItalic(): string {
    const item = this.typewriterItems[this.typewriterTextIndex];
    return item.italic.slice(0, Math.max(0, this.typewriterCharIndex - item.main.length));
  }

  private initTypewriter(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.runTypewriterStep();
  }

  private runTypewriterStep(): void {
    const item = this.typewriterItems[this.typewriterTextIndex];
    const totalLength = item.main.length + item.italic.length;

    const typingSpeed = 55;
    const holdDuration = 1800;
    const deletingSpeed = 32;

    if (this.typewriterPhase === 'typing') {
      if (this.typewriterCharIndex < totalLength) {
        this.typewriterCharIndex++;
        this.cdr.markForCheck();
        this.typewriterTimeout = setTimeout(() => this.runTypewriterStep(), typingSpeed);
      } else {
        this.typewriterPhase = 'holding';
        this.cdr.markForCheck();
        this.typewriterTimeout = setTimeout(() => this.runTypewriterStep(), holdDuration);
      }
    } else if (this.typewriterPhase === 'holding') {
      this.typewriterPhase = 'deleting';
      this.cdr.markForCheck();
      this.typewriterTimeout = setTimeout(() => this.runTypewriterStep(), deletingSpeed);
    } else if (this.typewriterPhase === 'deleting') {
      if (this.typewriterCharIndex > 0) {
        this.typewriterCharIndex--;
        this.cdr.markForCheck();
        this.typewriterTimeout = setTimeout(() => this.runTypewriterStep(), deletingSpeed);
      } else {
        this.typewriterTextIndex = (this.typewriterTextIndex + 1) % this.typewriterItems.length;
        this.typewriterPhase = 'typing';
        this.cdr.markForCheck();
        this.typewriterTimeout = setTimeout(() => this.runTypewriterStep(), typingSpeed);
      }
    }
  }

  private clearTypewriter(): void {
    if (this.typewriterTimeout) {
      clearTimeout(this.typewriterTimeout);
      this.typewriterTimeout = null;
    }
    if (this.whyClientsTypewriterTimeout) {
      clearTimeout(this.whyClientsTypewriterTimeout);
      this.whyClientsTypewriterTimeout = null;
    }
  }

  // =============================================================
  // ⌨️ TYPEWRITER FOR "Why Clients Love Us"
  // =============================================================
  whyClientsPhrases = [
    { prefix: 'Why Clients ', typed: 'Love Us' },
    { prefix: 'Why Clients ', typed: 'Trust Us' },
    { prefix: 'Why Clients ', typed: 'Choose Us' },
    { prefix: 'Why Clients ', typed: 'Return Always' }
  ];
  whyClientsPhraseIndex = 0;
  whyClientsCharIndex = 0;
  whyClientsPhase: 'typing' | 'holding' | 'deleting' = 'typing';
  private whyClientsTypewriterTimeout: any = null;

  get currentWhyClientsPrefix(): string {
    return this.whyClientsPhrases[this.whyClientsPhraseIndex].prefix;
  }

  get currentWhyClientsTyped(): string {
    const phrase = this.whyClientsPhrases[this.whyClientsPhraseIndex];
    return phrase.typed.slice(0, this.whyClientsCharIndex);
  }

  get isWhyClientsActivelyTyping(): boolean {
    const phrase = this.whyClientsPhrases[this.whyClientsPhraseIndex];
    return this.whyClientsPhase === 'deleting' || (this.whyClientsPhase === 'typing' && this.whyClientsCharIndex < phrase.typed.length);
  }

  private initWhyClientsTypewriter(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.runWhyClientsTypewriterStep();
  }

  private runWhyClientsTypewriterStep(): void {
    const phrase = this.whyClientsPhrases[this.whyClientsPhraseIndex];
    const totalLength = phrase.typed.length;

    const typeDelayMs = 70; // 0.07s
    const holdMs = 1800; // 1.8s
    const deleteDelayMs = 45; // 0.045s

    if (this.whyClientsPhase === 'typing') {
      if (this.whyClientsCharIndex < totalLength) {
        this.whyClientsCharIndex++;
        this.cdr.markForCheck();
        this.whyClientsTypewriterTimeout = setTimeout(() => this.runWhyClientsTypewriterStep(), typeDelayMs);
      } else {
        this.whyClientsPhase = 'holding';
        this.cdr.markForCheck();
        this.whyClientsTypewriterTimeout = setTimeout(() => this.runWhyClientsTypewriterStep(), holdMs);
      }
    } else if (this.whyClientsPhase === 'holding') {
      this.whyClientsPhase = 'deleting';
      this.cdr.markForCheck();
      this.whyClientsTypewriterTimeout = setTimeout(() => this.runWhyClientsTypewriterStep(), deleteDelayMs);
    } else if (this.whyClientsPhase === 'deleting') {
      if (this.whyClientsCharIndex > 0) {
        this.whyClientsCharIndex--;
        this.cdr.markForCheck();
        this.whyClientsTypewriterTimeout = setTimeout(() => this.runWhyClientsTypewriterStep(), deleteDelayMs);
      } else {
        this.whyClientsPhraseIndex = (this.whyClientsPhraseIndex + 1) % this.whyClientsPhrases.length;
        this.whyClientsPhase = 'typing';
        this.cdr.markForCheck();
        this.whyClientsTypewriterTimeout = setTimeout(() => this.runWhyClientsTypewriterStep(), typeDelayMs);
      }
    }
  }

  setCategory(cat: string) {
    this.selectedCategory = cat;
    this.cdr.markForCheck();
    
    // Animate cards in when category changes (slightly faster shuffle)
    this.triggerShuffleAnimation(0.8);
  }

  private triggerShuffleAnimation(duration: number = 1.2): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    setTimeout(() => {
      const cards = document.querySelectorAll('.tinore-service-card');
      if (!cards.length) return;
      
      gsap.fromTo(cards, 
        { 
          y: 150, 
          x: () => (Math.random() - 0.5) * 200, // random spread on X
          opacity: 0, 
          rotationX: () => (Math.random() - 0.5) * 60, // crazy 3d flip
          rotationY: () => (Math.random() - 0.5) * 60,
          rotationZ: () => (Math.random() - 0.5) * 45, // deal like a deck of cards
          scale: 0.4
        },
        { 
          y: 0, 
          x: 0, 
          opacity: 1, 
          rotationX: 0, 
          rotationY: 0, 
          rotationZ: 0,
          scale: 1, 
          duration: duration, 
          stagger: 0.1, 
          ease: 'back.out(1.5)', 
          transformPerspective: 1200, 
          clearProps: "transform" 
        }
      );
    }, 50); // slight delay to ensure DOM is updated after *ngFor / @for
  }

  setRoutineStep(idx: number) {
    this.routineDirection = idx > this.activeRoutineStep ? 1 : -1;
    this.activeRoutineStep = idx;
  }

  loadDynamicContent() {
    this.http.get<any[]>(`${environment.apiUrl}/coupons/active`)
    .subscribe({
      next: (coupons) => {
        if (coupons?.length > 0) {
          this.activeCoupons = coupons.slice(0, 3);
        }
        this.loadingDynamic = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loadingDynamic = false;
        this.cdr.markForCheck();
      }
    });
  }

  // Liquid Carve Button Pointer Tracking
  liquidBlobX = 0;
  liquidBlobY = 0;
  liquidScale = 0;

  onLiquidPointerEnter(event: PointerEvent): void {
    const target = event.currentTarget as HTMLElement;
    if (!target) return;
    const rect = target.getBoundingClientRect();
    this.liquidBlobX = event.clientX - (rect.left + rect.width / 2);
    this.liquidBlobY = event.clientY - (rect.top + rect.height / 2);
    this.liquidScale = 1;
    this.cdr.markForCheck();
  }

  onLiquidPointerMove(event: PointerEvent): void {
    const target = event.currentTarget as HTMLElement;
    if (!target) return;
    const rect = target.getBoundingClientRect();
    this.liquidBlobX = event.clientX - (rect.left + rect.width / 2);
    this.liquidBlobY = event.clientY - (rect.top + rect.height / 2);
    this.cdr.markForCheck();
  }

  onLiquidPointerLeave(): void {
    this.liquidScale = 0;
    this.cdr.markForCheck();
  }

  // =============================================================
  // 👁️ CREEPY BUTTON EYE-TRACKING (Vengence UI Port)
  // =============================================================
  creepyEyeX = 0;
  creepyEyeY = 0;
  isCreepyHovered = false;

  updateCreepyEyes(e: MouseEvent | TouchEvent, btnElem: HTMLElement): void {
    const userEvent = 'touches' in e ? (e as TouchEvent).touches[0] : (e as MouseEvent);
    if (!userEvent || !btnElem) return;

    const rect = btnElem.getBoundingClientRect();
    const eyesCenterX = rect.right - 28;
    const eyesCenterY = rect.bottom - 16;

    const dx = userEvent.clientX - eyesCenterX;
    const dy = userEvent.clientY - eyesCenterY;
    const angle = Math.atan2(-dy, dx) + Math.PI / 2;

    const visionRangeX = 180;
    const visionRangeY = 75;
    const distance = Math.hypot(dx, dy);

    this.creepyEyeX = (Math.sin(angle) * Math.min(distance, visionRangeX)) / visionRangeX;
    this.creepyEyeY = (Math.cos(angle) * Math.min(distance, visionRangeY)) / visionRangeY;
    this.isCreepyHovered = true;
    this.cdr.markForCheck();
  }

  resetCreepyEyes(): void {
    this.creepyEyeX = 0;
    this.creepyEyeY = 0;
    this.isCreepyHovered = false;
    this.cdr.markForCheck();
  }
}
