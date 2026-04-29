import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly STORAGE_KEY = 'theme-preference';
  
  // Reactive signal for theme state
  currentTheme = signal<Theme>(this.getStoredTheme());
  isDarkMode = signal<boolean>(this.checkDarkMode());

  constructor() {
    // Apply initial theme
    this.applyTheme(this.currentTheme());
    
    // Watch for system preference changes
    this.watchSystemPreference();
    
    // React to theme changes
    effect(() => {
      const theme = this.currentTheme();
      this.applyTheme(theme);
      localStorage.setItem(this.STORAGE_KEY, theme);
    });
  }

  /**
   * Set theme preference
   */
  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
    this.isDarkMode.set(this.checkDarkMode());
  }

  /**
   * Toggle between light and dark
   */
  toggleTheme(): void {
    const newTheme = this.isDarkMode() ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  /**
   * Get stored theme from localStorage
   */
  private getStoredTheme(): Theme {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
    return 'system';
  }

  /**
   * Check if dark mode should be active
   */
  private checkDarkMode(): boolean {
    const theme = this.currentTheme();
    if (theme === 'dark') return true;
    if (theme === 'light') return false;
    // System preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  /**
   * Apply theme to document
   */
  private applyTheme(theme: Theme): void {
    const isDark = theme === 'dark' || 
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    // Apply both class names for backward compatibility
    document.documentElement.classList.toggle('dark-theme', isDark);
    document.documentElement.classList.toggle('dark-mode', isDark);
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    
    // Update meta theme-color for mobile browsers
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', isDark ? '#1a1a2e' : '#7C3AED');
    }
  }

  /**
   * Watch for system preference changes
   */
  private watchSystemPreference(): void {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    mediaQuery.addEventListener('change', (e) => {
      if (this.currentTheme() === 'system') {
        this.isDarkMode.set(e.matches);
        this.applyTheme('system');
      }
    });
  }
}
