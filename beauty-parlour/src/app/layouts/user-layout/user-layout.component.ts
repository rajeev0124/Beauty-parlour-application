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
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [
    CommonModule, AsyncPipe, DecimalPipe,
    RouterOutlet, RouterLink, RouterLinkActive,
    MatIconModule, MatButtonModule, MatMenuModule, MatBadgeModule, MatDividerModule,
    ThemeToggleComponent
  ],
  templateUrl: './user-layout.component.html',
  styleUrl: './user-layout.component.scss'
})
export class UserLayoutComponent implements OnInit, OnDestroy {
  mobileMenuOpen = false;
  isScrolled = false;
  navHidden = false;
  private lastScrollY = 0;
  private isBrowser: boolean;
  private routerSub: Subscription | null = null;

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

    this.routerSub = this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.navHidden = false;
      this.isScrolled = false;
      this.lastScrollY = 0;
    });
  }

  ngOnDestroy(): void {
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }

  @HostListener('window:scroll', [])
  @HostListener('document:scroll', [])
  onWindowScroll(): void {
    if (!this.isBrowser) return;

    const currentScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    
    const newIsScrolled = currentScrollY > 20;
    let newNavHidden = this.navHidden;

    // Near top of page -> show header
    if (currentScrollY <= 50) {
      newNavHidden = false;
    } else {
      const scrollDiff = currentScrollY - this.lastScrollY;
      
      // Scroll down (diff > 4px) -> hide navbar
      if (scrollDiff > 4) {
        newNavHidden = true;
      } 
      // Scroll up (diff < -4px) -> reveal navbar
      else if (scrollDiff < -4) {
        newNavHidden = false;
      }
    }

    this.lastScrollY = Math.max(0, currentScrollY);

    if (newNavHidden !== this.navHidden || newIsScrolled !== this.isScrolled) {
      this.navHidden = newNavHidden;
      this.isScrolled = newIsScrolled;
      this.cdr.detectChanges();
    }
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get userName(): string {
    return this.authService.getCurrentUser()?.name || '';
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

  get userProfileImage(): string | null {
    const user = this.authService.getCurrentUser();
    if (!user?.profileImage) return null;
    // Handle both relative and absolute URLs
    if (user.profileImage.startsWith('http')) {
      return user.profileImage;
    }
    return `${environment.apiUrl.replace('/api', '')}${user.profileImage}`;
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
