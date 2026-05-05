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
    <!-- Premium Theme Toggle Button -->
    <button 
      class="theme-btn"
      [matMenuTriggerFor]="themeMenu"
      matTooltip="Theme"
      matTooltipPosition="below">
      <div class="theme-btn-inner" [class.dark]="themeService.isDarkMode()">
        <mat-icon class="theme-icon">{{ themeService.isDarkMode() ? 'dark_mode' : 'light_mode' }}</mat-icon>
      </div>
    </button>
    
    <!-- Premium Theme Menu -->
    <mat-menu #themeMenu="matMenu" class="premium-theme-menu">
      <div class="menu-container" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="menu-header">
          <div class="header-icon">
            <mat-icon>palette</mat-icon>
          </div>
          <div class="header-text">
            <h3>Appearance</h3>
            <p>Choose your theme</p>
          </div>
        </div>

        <!-- Theme Options -->
        <div class="theme-options">
          <!-- Light Theme -->
          <button 
            class="theme-card" 
            [class.active]="themeService.currentTheme() === 'light'"
            (click)="setTheme('light')">
            <div class="card-preview light-preview">
              <div class="preview-header"></div>
              <div class="preview-content">
                <div class="preview-line"></div>
                <div class="preview-line short"></div>
              </div>
            </div>
            <div class="card-info">
              <span class="card-name">Light</span>
              <mat-icon class="check-icon" *ngIf="themeService.currentTheme() === 'light'">check_circle</mat-icon>
            </div>
          </button>

          <!-- Dark Theme -->
          <button 
            class="theme-card" 
            [class.active]="themeService.currentTheme() === 'dark'"
            (click)="setTheme('dark')">
            <div class="card-preview dark-preview">
              <div class="preview-header"></div>
              <div class="preview-content">
                <div class="preview-line"></div>
                <div class="preview-line short"></div>
              </div>
            </div>
            <div class="card-info">
              <span class="card-name">Dark</span>
              <mat-icon class="check-icon" *ngIf="themeService.currentTheme() === 'dark'">check_circle</mat-icon>
            </div>
          </button>

          <!-- System Theme -->
          <button 
            class="theme-card system-card" 
            [class.active]="themeService.currentTheme() === 'system'"
            (click)="setTheme('system')">
            <div class="card-preview system-preview">
              <div class="preview-split">
                <div class="split-light">
                  <div class="preview-header"></div>
                  <div class="preview-content">
                    <div class="preview-line"></div>
                  </div>
                </div>
                <div class="split-dark">
                  <div class="preview-header"></div>
                  <div class="preview-content">
                    <div class="preview-line"></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="card-info">
              <span class="card-name">System</span>
              <mat-icon class="check-icon" *ngIf="themeService.currentTheme() === 'system'">check_circle</mat-icon>
            </div>
          </button>
        </div>
      </div>
    </mat-menu>
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
    }
    
    /* Toggle Button */
    .theme-btn {
      background: transparent;
      border: none;
      padding: 0;
      cursor: pointer;
      border-radius: 12px;
      transition: transform 0.2s ease;
      
      &:hover {
        transform: scale(1.05);
      }
      
      &:active {
        transform: scale(0.95);
      }
    }
    
    .theme-btn-inner {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(124, 58, 237, 0.1);
      transition: all 0.3s ease;
      
      &:hover {
        background: rgba(124, 58, 237, 0.15);
      }
      
      &.dark {
        background: rgba(139, 92, 246, 0.2);
        
        &:hover {
          background: rgba(139, 92, 246, 0.25);
        }
      }
    }
    
    .theme-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
      color: #7C3AED;
      transition: all 0.3s ease;
    }
    
    .dark .theme-icon {
      color: #A78BFA;
    }
    
    /* Menu Styles */
    ::ng-deep .premium-theme-menu {
      .mat-mdc-menu-panel {
        min-width: 280px !important;
        max-width: 280px !important;
        border-radius: 16px !important;
        background: #ffffff !important;
        border: 1px solid #E5E7EB !important;
        box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05) !important;
        overflow: hidden !important;
        padding: 0 !important;
      }
      
      .mat-mdc-menu-content {
        padding: 0 !important;
      }
    }
    
    [data-theme="dark"] ::ng-deep .premium-theme-menu,
    .dark-theme ::ng-deep .premium-theme-menu {
      .mat-mdc-menu-panel {
        background: #1F2937 !important;
        border-color: #374151 !important;
        box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05) !important;
      }
    }
    
    .menu-container {
      padding: 16px;
    }
    
    /* Header */
    .menu-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
      padding-bottom: 16px;
      border-bottom: 1px solid #E5E7EB;
    }
    
    [data-theme="dark"] .menu-header,
    .dark-theme .menu-header {
      border-bottom-color: #374151;
    }
    
    .header-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: linear-gradient(135deg, #7C3AED, #9333EA);
      display: flex;
      align-items: center;
      justify-content: center;
      
      mat-icon {
        color: white;
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }
    
    .header-text {
      h3 {
        margin: 0;
        font-size: 15px;
        font-weight: 600;
        color: #1F2937;
      }
      
      p {
        margin: 2px 0 0;
        font-size: 12px;
        color: #6B7280;
      }
    }
    
    [data-theme="dark"] .header-text h3,
    .dark-theme .header-text h3 {
      color: #F9FAFB;
    }
    
    [data-theme="dark"] .header-text p,
    .dark-theme .header-text p {
      color: #9CA3AF;
    }
    
    /* Theme Options Grid */
    .theme-options {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }
    
    /* Theme Card */
    .theme-card {
      background: transparent;
      border: 2px solid #E5E7EB;
      border-radius: 12px;
      padding: 0;
      cursor: pointer;
      transition: all 0.2s ease;
      overflow: hidden;
      
      &:hover {
        border-color: #D1D5DB;
        transform: translateY(-2px);
      }
      
      &.active {
        border-color: #7C3AED;
        box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.15);
      }
    }
    
    [data-theme="dark"] .theme-card,
    .dark-theme .theme-card {
      border-color: #374151;
      
      &:hover {
        border-color: #4B5563;
      }
      
      &.active {
        border-color: #8B5CF6;
        box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
      }
    }
    
    /* Card Preview */
    .card-preview {
      height: 52px;
      border-radius: 8px 8px 0 0;
      overflow: hidden;
      position: relative;
    }
    
    .light-preview {
      background: #F9FAFB;
      
      .preview-header {
        height: 12px;
        background: #E5E7EB;
        margin: 6px 6px 4px;
        border-radius: 3px;
      }
      
      .preview-content {
        padding: 0 6px;
        
        .preview-line {
          height: 6px;
          background: #D1D5DB;
          border-radius: 2px;
          margin-bottom: 4px;
          
          &.short {
            width: 60%;
          }
        }
      }
    }
    
    .dark-preview {
      background: #1F2937;
      
      .preview-header {
        height: 12px;
        background: #374151;
        margin: 6px 6px 4px;
        border-radius: 3px;
      }
      
      .preview-content {
        padding: 0 6px;
        
        .preview-line {
          height: 6px;
          background: #4B5563;
          border-radius: 2px;
          margin-bottom: 4px;
          
          &.short {
            width: 60%;
          }
        }
      }
    }
    
    .system-preview {
      .preview-split {
        display: flex;
        height: 100%;
      }
      
      .split-light {
        flex: 1;
        background: #F9FAFB;
        
        .preview-header {
          height: 10px;
          background: #E5E7EB;
          margin: 5px 4px 3px;
          border-radius: 2px;
        }
        
        .preview-content {
          padding: 0 4px;
          
          .preview-line {
            height: 5px;
            background: #D1D5DB;
            border-radius: 2px;
          }
        }
      }
      
      .split-dark {
        flex: 1;
        background: #1F2937;
        
        .preview-header {
          height: 10px;
          background: #374151;
          margin: 5px 4px 3px;
          border-radius: 2px;
        }
        
        .preview-content {
          padding: 0 4px;
          
          .preview-line {
            height: 5px;
            background: #4B5563;
            border-radius: 2px;
          }
        }
      }
    }
    
    /* Card Info */
    .card-info {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 8px 4px;
      background: #FFFFFF;
    }
    
    [data-theme="dark"] .card-info,
    .dark-theme .card-info {
      background: #111827;
    }
    
    .card-name {
      font-size: 11px;
      font-weight: 600;
      color: #374151;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    [data-theme="dark"] .card-name,
    .dark-theme .card-name {
      color: #D1D5DB;
    }
    
    .check-icon {
      font-size: 14px !important;
      width: 14px !important;
      height: 14px !important;
      color: #7C3AED;
    }
    
    [data-theme="dark"] .check-icon,
    .dark-theme .check-icon {
      color: #8B5CF6;
    }
  `]
})
export class ThemeToggleComponent {
  themeService = inject(ThemeService);

  setTheme(theme: Theme): void {
    this.themeService.setTheme(theme);
  }
}
