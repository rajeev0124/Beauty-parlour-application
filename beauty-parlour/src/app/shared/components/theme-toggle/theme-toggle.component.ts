import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ThemeService, Theme } from '../../../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatMenuModule, MatTooltipModule],
  template: `
    <!-- Beautiful Animated Toggle Button -->
    <button 
      class="theme-toggle-pill"
      (click)="quickToggle()"
      [matMenuTriggerFor]="themeMenu"
      #menuTrigger="matMenuTrigger"
      (contextmenu)="openMenu($event, menuTrigger)"
      matTooltip="Click to toggle • Right-click for options"
      matTooltipPosition="below">
      <div class="toggle-track" [class.dark]="themeService.isDarkMode()">
        <div class="toggle-icons">
          <div class="sun-icon" [class.active]="!themeService.isDarkMode()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          </div>
          <div class="moon-icon" [class.active]="themeService.isDarkMode()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          </div>
        </div>
        <div class="toggle-thumb" [class.dark]="themeService.isDarkMode()">
          <div class="thumb-glow"></div>
        </div>
      </div>
    </button>
    
    <mat-menu #themeMenu="matMenu" class="theme-selector-menu">
      <div class="theme-menu-header">
        <span class="theme-menu-title">Appearance</span>
        <span class="theme-menu-subtitle">Choose your theme</span>
      </div>
      <button mat-menu-item (click)="setTheme('light')" class="theme-option" [class.selected]="themeService.currentTheme() === 'light'">
        <div class="theme-option-icon light">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
        </div>
        <div class="theme-option-content">
          <span class="theme-option-name">Light</span>
          <span class="theme-option-desc">Bright and clear</span>
        </div>
        @if (themeService.currentTheme() === 'light') {
          <div class="theme-check"><mat-icon>check_circle</mat-icon></div>
        }
      </button>
      <button mat-menu-item (click)="setTheme('dark')" class="theme-option" [class.selected]="themeService.currentTheme() === 'dark'">
        <div class="theme-option-icon dark">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </div>
        <div class="theme-option-content">
          <span class="theme-option-name">Dark</span>
          <span class="theme-option-desc">Easy on the eyes</span>
        </div>
        @if (themeService.currentTheme() === 'dark') {
          <div class="theme-check"><mat-icon>check_circle</mat-icon></div>
        }
      </button>
      <button mat-menu-item (click)="setTheme('system')" class="theme-option" [class.selected]="themeService.currentTheme() === 'system'">
        <div class="theme-option-icon system">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
        </div>
        <div class="theme-option-content">
          <span class="theme-option-name">System</span>
          <span class="theme-option-desc">Match device settings</span>
        </div>
        @if (themeService.currentTheme() === 'system') {
          <div class="theme-check"><mat-icon>check_circle</mat-icon></div>
        }
      </button>
    </mat-menu>
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
    }
    
    .theme-toggle-pill {
      background: transparent;
      border: none;
      padding: 4px;
      cursor: pointer;
      border-radius: 50px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      
      &:hover {
        transform: scale(1.05);
      }
      
      &:active {
        transform: scale(0.95);
      }
    }
    
    .toggle-track {
      position: relative;
      width: 56px;
      height: 28px;
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fbbf24 100%);
      border-radius: 50px;
      transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 
        inset 0 2px 4px rgba(0, 0, 0, 0.1),
        0 2px 8px rgba(251, 191, 36, 0.3);
      overflow: hidden;
      
      &.dark {
        background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%);
        box-shadow: 
          inset 0 2px 4px rgba(0, 0, 0, 0.3),
          0 2px 8px rgba(99, 102, 241, 0.4);
      }
    }
    
    .toggle-icons {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 6px;
      z-index: 1;
    }
    
    .sun-icon, .moon-icon {
      width: 16px;
      height: 16px;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      opacity: 0.4;
      
      svg {
        width: 100%;
        height: 100%;
      }
      
      &.active {
        opacity: 1;
        transform: scale(1.1);
      }
    }
    
    .sun-icon {
      color: #f59e0b;
      
      &.active {
        filter: drop-shadow(0 0 4px rgba(245, 158, 11, 0.6));
      }
    }
    
    .moon-icon {
      color: #a5b4fc;
      
      &.active {
        filter: drop-shadow(0 0 4px rgba(165, 180, 252, 0.8));
      }
    }
    
    .toggle-thumb {
      position: absolute;
      top: 3px;
      left: 3px;
      width: 22px;
      height: 22px;
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
      border-radius: 50%;
      transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      box-shadow: 
        0 2px 8px rgba(0, 0, 0, 0.15),
        0 1px 3px rgba(0, 0, 0, 0.1);
      z-index: 2;
      
      &.dark {
        left: calc(100% - 25px);
        background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
        box-shadow: 
          0 2px 8px rgba(99, 102, 241, 0.3),
          0 1px 3px rgba(0, 0, 0, 0.2);
      }
    }
    
    .thumb-glow {
      position: absolute;
      inset: -2px;
      background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%);
      border-radius: 50%;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    .toggle-thumb:hover .thumb-glow {
      opacity: 1;
    }
    
    /* Menu Styles */
    ::ng-deep .theme-selector-menu {
      .mat-mdc-menu-panel {
        min-width: 240px !important;
        border-radius: 16px !important;
        background: var(--bg-card, #ffffff) !important;
        border: 1px solid var(--border-color, #e2e8f0) !important;
        box-shadow: 
          0 20px 40px rgba(0, 0, 0, 0.15),
          0 0 0 1px rgba(255, 255, 255, 0.05) !important;
        overflow: hidden !important;
        padding: 0 !important;
      }
      
      .mat-mdc-menu-content {
        padding: 0 !important;
      }
    }
    
    .theme-menu-header {
      padding: 16px 16px 12px;
      border-bottom: 1px solid var(--border-color, #e2e8f0);
      background: linear-gradient(135deg, var(--brand-bg, rgba(124, 58, 237, 0.05)) 0%, transparent 100%);
    }
    
    .theme-menu-title {
      display: block;
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary, #1a1a2e);
      margin-bottom: 2px;
    }
    
    .theme-menu-subtitle {
      display: block;
      font-size: 12px;
      color: var(--text-secondary, #64748b);
    }
    
    .theme-option {
      display: flex !important;
      align-items: center !important;
      gap: 12px !important;
      padding: 12px 16px !important;
      min-height: 64px !important;
      transition: all 0.2s ease !important;
      
      &:hover {
        background: var(--bg-hover, rgba(124, 58, 237, 0.05)) !important;
      }
      
      &.selected {
        background: var(--brand-bg, rgba(124, 58, 237, 0.1)) !important;
      }
    }
    
    .theme-option-icon {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      
      svg {
        width: 20px;
        height: 20px;
      }
      
      &.light {
        background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
        color: #f59e0b;
        box-shadow: 0 2px 8px rgba(245, 158, 11, 0.2);
      }
      
      &.dark {
        background: linear-gradient(135deg, #312e81 0%, #4338ca 100%);
        color: #a5b4fc;
        box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
      }
      
      &.system {
        background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
        color: #6366f1;
        box-shadow: 0 2px 8px rgba(99, 102, 241, 0.15);
      }
    }
    
    .theme-option-content {
      flex: 1;
      min-width: 0;
    }
    
    .theme-option-name {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: var(--text-primary, #1a1a2e);
    }
    
    .theme-option-desc {
      display: block;
      font-size: 12px;
      color: var(--text-secondary, #64748b);
      margin-top: 1px;
    }
    
    .theme-check {
      color: var(--brand, #7c3aed);
      
      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }
  `]
})
export class ThemeToggleComponent {
  themeService = inject(ThemeService);

  get currentIcon(): string {
    const theme = this.themeService.currentTheme();
    if (theme === 'dark') return 'dark_mode';
    if (theme === 'light') return 'light_mode';
    return this.themeService.isDarkMode() ? 'dark_mode' : 'light_mode';
  }

  quickToggle(): void {
    this.themeService.toggleTheme();
  }

  openMenu(event: MouseEvent, trigger: any): void {
    event.preventDefault();
    trigger.openMenu();
  }

  setTheme(theme: Theme): void {
    this.themeService.setTheme(theme);
  }
}
