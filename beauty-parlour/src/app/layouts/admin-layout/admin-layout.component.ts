import { Component, OnDestroy, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    MatSidenavModule, MatToolbarModule, MatListModule,
    MatIconModule, MatButtonModule, MatMenuModule, MatBadgeModule, MatDividerModule, MatTooltipModule,
    ThemeToggleComponent
  ],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss'
})
export class AdminLayoutComponent implements OnDestroy {
  sidenavOpened = true;
  notificationCount = 0;
  isMobile = false;
  themeService = inject(ThemeService);
  private destroy$ = new Subject<void>();
  private resizeListener: () => void;

  private searchRouteMap: Record<string, string> = {
    dashboard: '/admin/dashboard',
    customers: '/admin/customers',
    staff: '/admin/staff',
    schedule: '/admin/schedule',
    services: '/admin/services',
    packages: '/admin/packages',
    appointments: '/admin/appointments',
    products: '/admin/products',
    inventory: '/admin/inventory',
    orders: '/admin/orders',
    payments: '/admin/payments',
    coupons: '/admin/coupons',
    reviews: '/admin/reviews',
    loyalty: '/admin/loyalty',
    rewards: '/admin/loyalty',
    expenses: '/admin/expenses',
    settings: '/admin/settings',
  };

  constructor(private authService: AuthService, private router: Router) {
    this.checkMobile();
    this.resizeListener = () => this.checkMobile();
    window.addEventListener('resize', this.resizeListener);

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      if (this.isMobile && this.sidenavOpened) {
        this.sidenavOpened = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    window.removeEventListener('resize', this.resizeListener);
  }

  private checkMobile(): void {
    this.isMobile = window.innerWidth <= 768;
    // Auto-collapse sidebar on small laptops to free content space
    if (window.innerWidth <= 1100 && this.sidenavOpened) {
      this.sidenavOpened = false;
    }
  }

  get userName(): string {
    return this.authService.getCurrentUser()?.name || 'Admin';
  }

  toggleSidenav(): void {
    this.sidenavOpened = !this.sidenavOpened;
  }

  onSearch(event: Event): void {
    const query = (event.target as HTMLInputElement).value.trim().toLowerCase();
    const route = this.searchRouteMap[query];
    if (route) {
      this.router.navigate([route]);
      (event.target as HTMLInputElement).value = '';
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
