import { Component, HostListener, OnInit, OnDestroy, ChangeDetectorRef, NgZone, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule, AsyncPipe, DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../core/services/auth.service';
import { CartService, CartItem } from '../../core/services/cart.service';
import { environment } from '../../../environments/environment';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle/theme-toggle.component';
import { SmokyTextComponent } from '../../shared/components/smoky-text/smoky-text.component';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [
    CommonModule, AsyncPipe, DecimalPipe,
    RouterOutlet, RouterLink, RouterLinkActive,
    MatIconModule, MatButtonModule, MatMenuModule, MatBadgeModule, MatDividerModule,
    SmokyTextComponent,
  ],
  templateUrl: './user-layout.component.html',
  styleUrl: './user-layout.component.scss'
})
export class UserLayoutComponent implements OnInit, OnDestroy {
  mobileMenuOpen = false;
  isScrolled = false;
  navHidden = false;
  showBackToTop = false;
  private lastScrollY = 0;
  private isBrowser: boolean;
  private routerSub: Subscription | null = null;

  get whatsAppNumber(): string {
    return environment.whatsAppNumber || '919876543210';
  }

  get whatsAppConciergeUrl(): string {
    const phone = this.whatsAppNumber.replace(/[^0-9]/g, '');
    const msg = encodeURIComponent('Hi Sindhura Makeovers! I would like to inquire about your parlour services & bridal bookings.');
    return `https://wa.me/${phone}?text=${msg}`;
  }

  private animObserver: IntersectionObserver | null = null;

  private headerResizeObserver: ResizeObserver | null = null;

  constructor(
    private authService: AuthService,
    public cartService: CartService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;

    this.lastScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;

    this.initHeaderMeasurement();

    this.routerSub = this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.navHidden = false;
      this.isScrolled = false;
      this.lastScrollY = 0;
      this.closeMobileMenu();
      this.updateHeaderHeight();
      setTimeout(() => this.init3DScrollObserver(), 120);
    });

    setTimeout(() => {
      this.updateHeaderHeight();
      this.init3DScrollObserver();
    }, 150);
  }

  ngOnDestroy(): void {
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
    if (this.animObserver) {
      this.animObserver.disconnect();
    }
    if (this.headerResizeObserver) {
      this.headerResizeObserver.disconnect();
    }
  }

  private initHeaderMeasurement(): void {
    if (!this.isBrowser) return;
    this.updateHeaderHeight();

    const header = document.querySelector('.top-header-sticky-wrapper') as HTMLElement;
    if (header && typeof ResizeObserver !== 'undefined') {
      this.headerResizeObserver = new ResizeObserver(() => {
        this.updateHeaderHeight();
      });
      this.headerResizeObserver.observe(header);
    }

    window.addEventListener('resize', () => this.updateHeaderHeight(), { passive: true });
  }

  private updateHeaderHeight(): void {
    if (!this.isBrowser) return;
    const header = document.querySelector('.top-header-sticky-wrapper') as HTMLElement;
    if (header) {
      const height = Math.ceil(header.getBoundingClientRect().height);
      if (height > 0) {
        document.documentElement.style.setProperty('--user-header-height', `${height}px`);
      }
    }
  }

  init3DScrollObserver(): void {
    if (!this.isBrowser) return;

    this.ngZone.runOutsideAngular(() => {
      if (this.animObserver) {
        this.animObserver.disconnect();
      }

      this.animObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('anim-visible');
              this.animObserver?.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.05, rootMargin: '0px 0px -25px 0px' }
      );

      const targets = document.querySelectorAll('.anim-3d:not(.anim-visible)');
      targets.forEach((el: Element) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.classList.add('anim-visible');
        } else {
          this.animObserver!.observe(el);
        }
      });
    });
  }

  @HostListener('window:scroll', [])
  @HostListener('document:scroll', [])
  onWindowScroll(): void {
    if (!this.isBrowser) return;

    const currentScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    
    const newIsScrolled = currentScrollY > 20;

    // Header is visible in the hero section (top 350px) or if mobile menu is open.
    // When scrolling down past the hero section, header hides.
    // When visiting/reaching back up to the hero section, it appears.
    const newNavHidden = currentScrollY > 350 && !this.mobileMenuOpen;

    this.lastScrollY = Math.max(0, currentScrollY);

    const newShowBackToTop = currentScrollY > 400;

    if (newNavHidden !== this.navHidden || newIsScrolled !== this.isScrolled || newShowBackToTop !== this.showBackToTop) {
      this.navHidden = newNavHidden;
      this.isScrolled = newIsScrolled;
      this.showBackToTop = newShowBackToTop;
      this.cdr.detectChanges();
    }
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get userName(): string {
    return this.authService.getCurrentUser()?.name || 'User';
  }

  get userFirstName(): string {
    return this.userName.split(' ')[0];
  }

  get userInitial(): string {
    return this.userName.charAt(0).toUpperCase();
  }

  get userEmail(): string {
    return this.authService.getCurrentUser()?.email || '';
  }

  currentYear = new Date().getFullYear();

  scrollToTop(): void {
    if (this.isBrowser) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
