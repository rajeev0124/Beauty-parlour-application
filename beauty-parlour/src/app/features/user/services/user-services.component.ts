import { 
  Component, 
  OnInit, 
  AfterViewInit, 
  OnDestroy, 
  ChangeDetectionStrategy, 
  ChangeDetectorRef, 
  ElementRef, 
  NgZone, 
  Inject, 
  PLATFORM_ID,
  HostListener
} from '@angular/core';
import { isPlatformBrowser, DecimalPipe, CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ServiceService } from '../../../core/services/service.service';
import { WhatsAppService } from '../../../core/services/whatsapp.service';
import { Service } from '../../../core/models/service.model';
import { 
  ServiceDetailInfo, 
  getServiceDetailData, 
  DEFAULT_SERVICES_LIST 
} from './service-details-data';

@Component({
  selector: 'app-user-services',
  standalone: true,
  imports: [RouterLink, DecimalPipe, CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './user-services.component.html',
  styleUrl: './user-services.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserServicesComponent implements OnInit, AfterViewInit, OnDestroy {
  activeCategory = 'all';
  loading = true;
  errorMessage = '';

  // Service Details Modal State
  selectedService: Service | null = null;
  selectedServiceIndex = 0;
  selectedServiceDetail: ServiceDetailInfo | null = null;
  isModalOpen = false;

  private isBrowser: boolean;
  private observer: IntersectionObserver | null = null;

  categories = [
    { key: 'all', label: 'All Services', icon: 'apps' },
    { key: 'hair', label: 'Hair Care', icon: 'content_cut' },
    { key: 'skin', label: 'Skin Care', icon: 'face_retouching_natural' },
    { key: 'nails', label: 'Nails & Spa', icon: 'brush' },
    { key: 'bridal', label: 'Bridal & Glam', icon: 'favorite' },
  ];

  // 100% Original & Accurate photography mapped directly by Service Name
  private serviceNameImageMap: Record<string, string> = {
    // 1. Hair Cut – Women (Precision styling, blowout finish in luxury salon)
    'hair cut - women': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
    'hair cut – women': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
    'haircut - women': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
    'haircut': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',

    // 2. Hair Coloring (Dimensional balayage, gloss tone & highlights in salon)
    'hair coloring': 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80',
    'hair colouring': 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80',
    'hair color': 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80',

    // 3. Hair Deep Conditioning (Restorative botanical hair spa & intense moisture mask)
    'hair deep conditioning': 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80',
    'deep conditioning': 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80',
    'hair spa': 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80',

    // 4. Keratin Treatment (Ultra-glossy, glass-hair frizz-free straightening transformation)
    'keratin treatment': 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80',
    'keratin': 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80',

    // 5. Classic Facial (Deep organic cleansing, gentle pore exfoliation & hydration)
    'classic facial': 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
    'facial': 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',

    // 6. Gold Facial (24K gold radiance infusion anti-aging facial mask therapy)
    'gold facial': 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=800&q=80',
    'luxury gold facial': 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=800&q=80',

    // 7. Cleanup (Express purifying pore cleanup, herbal toning & instant glow)
    'cleanup': 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=800&q=80',
    'face cleanup': 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=800&q=80',
    'skin cleanup': 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=800&q=80',

    // 8. Manicure (Artisan hand grooming, cuticle massage, nail shaping & polish)
    'manicure': 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80',
    'classic manicure': 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80',

    // 9. Pedicure (Soothing foot spa petal bath, botanical scrub & toe grooming)
    'pedicure': 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=800&q=80',
    'classic pedicure': 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=800&q=80',
    'foot spa': 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=800&q=80',

    // 10. Gel Nails (High-gloss UV gel polish with fine aesthetic nail artistry)
    'gel nails': 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=800&q=80',
    'nail extensions': 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=800&q=80',
    'gel nail art': 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=800&q=80',

    // 11. Bridal Makeup (Royal Indian bridal makeover, ornate jewelry & HD airbrush glamour)
    'bridal makeup': 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
    'pre-bridal package': 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=800&q=80',
    'bridal package': 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',

    // 12. Party Makeup (Celebration glam with sculpted cheekbones, shimmer & bold lip styling)
    'party makeup': 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80',
    'glam makeup': 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80',
    'occasion makeup': 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80'
  };

  // High quality category backups
  private serviceImages: Record<string, string[]> = {
    hair: [
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80'
    ],
    skin: [
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=800&q=80'
    ],
    nails: [
      'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&w=800&q=80'
    ],
    bridal: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1457972729786-0411a3b2b626?auto=format&fit=crop&w=800&q=80'
    ],
    default: [
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80'
    ]
  };

  // Service icon mapping by category
  private serviceIcons: Record<string, string> = {
    hair: 'content_cut',
    skin: 'face_retouching_natural',
    nails: 'brush',
    bridal: 'favorite',
    makeup: 'face',
    body: 'local_florist',
    default: 'auto_awesome'
  };

  // Track image load failures
  imageErrors: Set<string> = new Set();
  allServices: Service[] = [];

  constructor(
    private serviceService: ServiceService,
    public whatsAppService: WhatsAppService,
    private cdr: ChangeDetectorRef,
    private el: ElementRef,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  quickBookOnWhatsApp(service: Service): void {
    this.whatsAppService.sendServiceInquiry(service);
    this.closeModal();
  }

  ngOnInit(): void {
    this.loadServices();
  }

  ngAfterViewInit(): void {
    this.init3DAnimations();
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  @HostListener('window:keydown.escape')
  handleEscapeKey(): void {
    if (this.isModalOpen) {
      this.closeModal();
    }
  }

  loadServices(): void {
    this.loading = true;
    this.errorMessage = '';
    this.serviceService.getAll().subscribe({
      next: (services) => {
        if (services && services.length > 0) {
          this.allServices = services;
        } else {
          // Reliable luxury fallback with all 12 services
          this.allServices = DEFAULT_SERVICES_LIST;
        }
        this.loading = false;
        this.cdr.markForCheck();
        setTimeout(() => this.init3DAnimations(), 80);
      },
      error: () => {
        // Fallback to all 12 default services so the page is always fully functional
        this.allServices = DEFAULT_SERVICES_LIST;
        this.loading = false;
        this.cdr.markForCheck();
        setTimeout(() => this.init3DAnimations(), 80);
      }
    });
  }

  openServiceDetails(service: Service, index = 0): void {
    this.selectedService = service;
    this.selectedServiceIndex = index;
    this.selectedServiceDetail = getServiceDetailData(
      service.name,
      service.category,
      service.description
    );
    this.isModalOpen = true;

    if (this.isBrowser) {
      document.body.style.overflow = 'hidden';
    }
    this.cdr.markForCheck();
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedService = null;
    this.selectedServiceDetail = null;

    if (this.isBrowser) {
      document.body.style.overflow = '';
    }
    this.cdr.markForCheck();
  }

  selectCategory(categoryKey: string, event?: Event): void {
    this.activeCategory = categoryKey;
    if (event?.currentTarget && this.isBrowser) {
      (event.currentTarget as HTMLElement).scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    }
    this.cdr.markForCheck();
    setTimeout(() => this.init3DAnimations(), 60);
  }

  get filteredServices(): Service[] {
    if (this.activeCategory === 'all') return this.allServices;
    return this.allServices.filter(s => s.category === this.activeCategory);
  }

  getCategoryLabel(key: string): string {
    const cat = this.categories.find(c => c.key === key);
    return cat ? cat.label : key;
  }

  getServiceIcon(category: string): string {
    return this.serviceIcons[category?.toLowerCase()] || this.serviceIcons['default'];
  }

  getServiceImage(service: Service, index = 0): string {
    // 1. Direct custom image property from database if valid
    if (service.image && service.image.trim().length > 0 && !this.imageErrors.has(service._id)) {
      return service.image;
    }

    // 2. Normalized Name Matching (100% exact mapping)
    const rawName = (service.name || '').toLowerCase();
    const normalizedName = rawName.replace(/[–—]/g, '-').trim();

    if (this.serviceNameImageMap[normalizedName]) {
      return this.serviceNameImageMap[normalizedName];
    }

    // 3. Keyword-based matching for maximum accuracy
    if (normalizedName.includes('cut')) return this.serviceNameImageMap['hair cut - women'];
    if (normalizedName.includes('color') || normalizedName.includes('colour') || normalizedName.includes('balayage')) {
      return this.serviceNameImageMap['hair coloring'];
    }
    if (normalizedName.includes('condition') || normalizedName.includes('spa')) {
      return this.serviceNameImageMap['hair deep conditioning'];
    }
    if (normalizedName.includes('keratin') || normalizedName.includes('straight')) {
      return this.serviceNameImageMap['keratin treatment'];
    }
    if (normalizedName.includes('gold')) {
      return this.serviceNameImageMap['gold facial'];
    }
    if (normalizedName.includes('clean')) {
      return this.serviceNameImageMap['cleanup'];
    }
    if (normalizedName.includes('facial') || normalizedName.includes('peel')) {
      return this.serviceNameImageMap['classic facial'];
    }
    if (normalizedName.includes('mani')) {
      return this.serviceNameImageMap['manicure'];
    }
    if (normalizedName.includes('pedi')) {
      return this.serviceNameImageMap['pedicure'];
    }
    if (normalizedName.includes('gel') || normalizedName.includes('nail') || normalizedName.includes('extension')) {
      return this.serviceNameImageMap['gel nails'];
    }
    if (normalizedName.includes('bridal') || normalizedName.includes('wedding')) {
      return this.serviceNameImageMap['bridal makeup'];
    }
    if (normalizedName.includes('party') || normalizedName.includes('glam') || normalizedName.includes('makeup')) {
      return this.serviceNameImageMap['party makeup'];
    }

    // 4. Category collection fallback
    const images = this.serviceImages[service.category?.toLowerCase()] || this.serviceImages['default'];
    return images[index % images.length];
  }

  onImageError(event: Event, serviceId: string): void {
    this.imageErrors.add(serviceId);
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  hasImageError(serviceId: string): boolean {
    return this.imageErrors.has(serviceId);
  }

  private init3DAnimations(): void {
    if (!this.isBrowser) return;

    this.ngZone.runOutsideAngular(() => {
      if (this.observer) {
        this.observer.disconnect();
      }

      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('anim-visible');
              this.observer?.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
      );

      const targets = this.el.nativeElement.querySelectorAll('.anim-3d');
      targets.forEach((t: Element) => {
        // If already in viewport on load, reveal immediately
        const rect = t.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          t.classList.add('anim-visible');
        } else {
          this.observer!.observe(t);
        }
      });
    });
  }
}
