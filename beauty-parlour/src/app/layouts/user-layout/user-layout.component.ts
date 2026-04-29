import { Component, HostListener } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    MatIconModule, MatButtonModule, MatMenuModule, MatBadgeModule, MatDividerModule,
    ThemeToggleComponent
  ],
  templateUrl: './user-layout.component.html',
  styleUrl: './user-layout.component.scss'
})
export class UserLayoutComponent {
  mobileMenuOpen = false;
  isScrolled = false;

  constructor(private authService: AuthService, private router: Router) {}

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isScrolled = window.scrollY > 10;
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
