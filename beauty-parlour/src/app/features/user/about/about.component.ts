import { Component, OnInit, OnDestroy, AfterViewInit, NgZone, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterLink,
    MatIconModule
  ],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent implements OnInit, AfterViewInit, OnDestroy {
  openFaqIndex: number | null = 0;
  private observer: IntersectionObserver | null = null;
  private isBrowser: boolean;

  // --- Typewriter Animation ---
  private readonly typewriterTexts = [
    'Where Luxury Meets Personal Style',
    'Where Artistry Meets Individual Grace',
    'Where Beauty Meets Timeless Elegance',
  ];
  private readonly typingSpeed = 55;
  private readonly deletingSpeed = 32;
  private readonly holdDuration = 2200;

  displayedText = 'Where Luxury Meets Personal Style';
  cursorOn = true;

  private textIndex = 0;
  private charIndex = 33; // Length of 'Where Luxury Meets Personal Style'
  private phase: 'typing' | 'holding' | 'deleting' = 'holding';
  private timer: ReturnType<typeof setTimeout> | null = null;
  private cursorInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private el: ElementRef,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;

    this.startCursorBlink();
    // Hold the first full phrase on screen, then begin cycling
    this.timer = setTimeout(() => {
      this.phase = 'deleting';
      this.runTypewriter();
    }, this.holdDuration);
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    this.ngZone.runOutsideAngular(() => {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('anim-visible');
              this.observer?.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12 }
      );
      const targets = this.el.nativeElement.querySelectorAll('.anim-3d');
      targets.forEach((t: Element) => this.observer!.observe(t));
    });
  }

  ngOnDestroy(): void {
    if (this.timer) clearTimeout(this.timer);
    if (this.cursorInterval) clearInterval(this.cursorInterval);
    this.observer?.disconnect();
  }

  private get currentText(): string {
    return this.typewriterTexts[this.textIndex] ?? '';
  }

  private runTypewriter(): void {
    if (!this.isBrowser) return;
    if (this.timer) clearTimeout(this.timer);

    if (this.phase === 'typing') {
      this.cursorOn = true;
      if (this.cursorInterval) { clearInterval(this.cursorInterval); this.cursorInterval = null; }

      if (this.charIndex < this.currentText.length) {
        this.displayedText = this.currentText.slice(0, ++this.charIndex);
        this.cdr.markForCheck();
        this.cdr.detectChanges();
        this.timer = setTimeout(() => this.runTypewriter(), this.typingSpeed);
      } else {
        this.phase = 'holding';
        this.startCursorBlink();
        this.timer = setTimeout(() => {
          this.phase = 'deleting';
          if (this.cursorInterval) { clearInterval(this.cursorInterval); this.cursorInterval = null; }
          this.cursorOn = true;
          this.cdr.markForCheck();
          this.cdr.detectChanges();
          this.runTypewriter();
        }, this.holdDuration);
      }
    } else if (this.phase === 'deleting') {
      if (this.charIndex > 0) {
        this.displayedText = this.currentText.slice(0, --this.charIndex);
        this.cdr.markForCheck();
        this.cdr.detectChanges();
        this.timer = setTimeout(() => this.runTypewriter(), this.deletingSpeed);
      } else {
        this.textIndex = (this.textIndex + 1) % this.typewriterTexts.length;
        this.phase = 'typing';
        this.timer = setTimeout(() => this.runTypewriter(), 120);
      }
    }
  }

  private startCursorBlink(): void {
    if (this.cursorInterval) clearInterval(this.cursorInterval);
    this.cursorInterval = setInterval(() => {
      this.cursorOn = !this.cursorOn;
      this.cdr.markForCheck();
    }, 530);
  }
  // --- End Typewriter Animation ---

  stats = [
    { value: '11+', label: 'Years of Heritage', icon: 'workspace_premium' },
    { value: '15K+', label: 'Celebrated Brides & Patrons', icon: 'favorite' },
    { value: '50+', label: 'Certified Artisans', icon: 'stars' },
    { value: '4.9 ★', label: 'Patron Trust Score', icon: 'verified' }
  ];

  standards = [
    {
      num: '01',
      title: 'Medical-Grade Hygiene',
      desc: 'Hospital-grade 3-tier autoclave and UV sterilization for all implements, with single-use eco-friendly linens for every guest.',
      icon: 'sanitizer'
    },
    {
      num: '02',
      title: 'Clean & Proven Actives',
      desc: 'Dermatologist-tested, cruelty-free, and internationally certified skincare and haircare formulations with zero parabens.',
      icon: 'spa'
    },
    {
      num: '03',
      title: 'Private Bridal Suites',
      desc: 'Exclusive private dressing suites with cinema-grade high-CRI vanity illumination for absolute tone precision.',
      icon: 'meeting_room'
    },
    {
      num: '04',
      title: 'Diagnostic Consultations',
      desc: 'Detailed digital skin and scalp diagnostic assessments prior to formulating every tailored treatment.',
      icon: 'biotech'
    }
  ];

  transformations = [
    {
      title: 'Signature Royal Bridal HD Makeover',
      category: 'Bridal Artistry',
      artist: 'Sindhura Sharma',
      time: '3.5 Hours',
      image: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=700&q=85',
      badge: 'Bridal Glow'
    },
    {
      title: 'Hydra-Infusion Botanical Skin Therapy',
      category: 'Clinical Dermatology',
      artist: 'Dr. Kavitha Nair',
      time: '75 Mins',
      image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=700&q=85',
      badge: 'Skin Rejuvenation'
    },
    {
      title: 'Botoplex Silk Protein Hair Restructure',
      category: 'Trichology & Styling',
      artist: 'Anitha Raj',
      time: '2.5 Hours',
      image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=700&q=85',
      badge: 'Hair Artistry'
    }
  ];

  team = [
    {
      name: 'Sindhura Sharma',
      role: 'Founder & Lead Bridal Curator',
      experience: '12+ Yrs Exp',
      specialty: 'HD Airbrush Bridal & Celebrity Styling',
      image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=500&q=85',
      bio: 'Trained in Milan & London. Curated over 850+ high-profile wedding makeovers across South India.',
      social: { instagram: 'https://www.instagram.com/sindhura_makeovers/?hl=en' }
    },
    {
      name: 'Anitha Raj',
      role: 'Master Hair Director',
      experience: '9+ Yrs Exp',
      specialty: 'Balayage, Botoplex & Hair Restructuring',
      image: 'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=500&q=85',
      bio: 'Expert colorist certified by L\'Oréal Professionnel Academy with signature blend techniques.',
      social: { instagram: 'https://www.instagram.com/sindhura_makeovers/?hl=en' }
    },
    {
      name: 'Dr. Kavitha Nair',
      role: 'Chief Aesthetic Dermatologist',
      experience: '10+ Yrs Exp',
      specialty: 'Hydra-Facials & Clinical Skin Therapies',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500&q=85',
      bio: 'Specialist in non-invasive clinical skin rejuvenation and pigment correction protocols.',
      social: { instagram: 'https://www.instagram.com/sindhura_makeovers/?hl=en' }
    },
    {
      name: 'Deepa Menon',
      role: 'Senior Bridal Draping & Hair Artisan',
      experience: '8+ Yrs Exp',
      specialty: 'Traditional Kanjeevaram Draping & Floral Art',
      image: 'https://images.unsplash.com/photo-1614289371518-722f2615943d?w=500&q=85',
      bio: 'Renowned for intricate floral styling and traditional South Indian bridal drapery perfection.',
      social: { instagram: 'https://www.instagram.com/sindhura_makeovers/?hl=en' }
    },
  ];


  milestones = [
    { year: '2013', title: 'The Genesis', description: 'Established as an exclusive bridal studio with 3 master artisans.' },
    { year: '2016', title: 'Clinical Dermatology', description: 'Expanded into medical-grade aesthetic skin therapies and organic scalp rejuvenation rituals.' },
    { year: '2019', title: 'Regional Recognition', description: 'Recognized as South India’s Most Trusted Luxury Bridal and Beauty Sanctuary.' },
    { year: '2022', title: 'On-Location Artistry', description: 'Introduced mobile bridal vanity suites and high-definition destination wedding services.' },
    { year: '2024+', title: 'A Living Legacy', description: 'Proudly serving 15,000+ patrons with an accredited collective of 50+ beauty professionals.' }
  ];

  testimonials = [
    {
      name: 'Sneha Reddy',
      role: 'Bride (Grand Hyatt Wedding)',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
      rating: 5,
      text: 'Sindhura and her team made my wedding day completely stress-free. The HD airbrush makeup stayed luminous through 14 hours of continuous festivities and bright stage lights without a single touch-up!',
      service: 'Muhurtham Bridal Package'
    },
    {
      name: 'Meera Patel',
      role: 'Corporate Executive',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
      rating: 5,
      text: 'The Hydra-Infusion facial gave me noticeable, long-lasting clarity. The private suites are peaceful, impeccably sanitized, and feel like a true 5-star retreat.',
      service: 'Hydra-Infusion Ritual'
    },
    {
      name: 'Anjali Kumar',
      role: 'Fashion Model & Creator',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
      rating: 5,
      text: 'From Botoplex hair therapy to intricate nail extensions, this is the only salon in the city I trust blindly. The attention to detail and personalized care is world-class.',
      service: 'Hair Restoration & Styling'
    }
  ];

  faqs = [
    {
      q: 'How far in advance should I book my bridal styling package?',
      a: 'We recommend booking 2 to 6 months in advance, especially during peak wedding seasons (October – February), to secure your preferred master artist and private suite.'
    },
    {
      q: 'Do you offer a pre-bridal trial and consultation session?',
      a: 'Yes, all our comprehensive bridal packages include an unhurried 90-minute trial session where we test makeup tones, hair accessories, and saree draping styles.'
    },
    {
      q: 'Are your skincare and hair products suitable for sensitive skin?',
      a: 'Absolutely. We use 100% hypoallergenic, non-comedogenic formulations certified by international dermatological labs. Every service begins with a patch test.'
    },
    {
      q: 'Can your master artists travel to the wedding venue or destination?',
      a: 'Yes, our specialized On-Location Bridal Team travels across India and internationally with portable cinema lighting and complete vanity setups.'
    }
  ];

  toggleFaq(index: number): void {
    this.openFaqIndex = this.openFaqIndex === index ? null : index;
  }

  getStars(rating: number): number[] {
    return Array(rating).fill(0);
  }
}
