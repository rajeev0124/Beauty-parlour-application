import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { NotificationService, Notification } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule
  ],
  template: `
    <button 
      mat-icon-button 
      [matMenuTriggerFor]="notificationMenu"
      class="notification-btn"
      [matBadge]="unreadCount() > 0 ? unreadCount() : null"
      matBadgeColor="warn"
      matBadgeSize="small">
      <mat-icon>notifications</mat-icon>
    </button>
    
    <mat-menu #notificationMenu="matMenu" class="notification-menu" xPosition="before">
      <div class="notification-header" (click)="$event.stopPropagation()">
        <h3>Notifications</h3>
        @if (unreadCount() > 0) {
          <button mat-button color="primary" (click)="markAllAsRead()">
            Mark all read
          </button>
        }
      </div>
      
      <mat-divider></mat-divider>
      
      @if (notifications().length === 0) {
        <div class="empty-state">
          <mat-icon>notifications_none</mat-icon>
          <p>No notifications yet</p>
        </div>
      } @else {
        <div class="notification-list">
          @for (notification of notifications().slice(0, 10); track notification.id) {
            <div 
              class="notification-item"
              [class.unread]="!notification.read"
              [class.notification-success]="notification.type === 'success'"
              [class.notification-error]="notification.type === 'error'"
              [class.notification-warning]="notification.type === 'warning'"
              (click)="onNotificationClick(notification)">
              <div class="notification-icon">
                <mat-icon>{{ getIcon(notification.type) }}</mat-icon>
              </div>
              <div class="notification-content">
                <div class="notification-title">{{ notification.title }}</div>
                <div class="notification-message">{{ notification.message }}</div>
                <div class="notification-time">{{ formatTime(notification.timestamp) }}</div>
              </div>
            </div>
          }
        </div>
        
        @if (notifications().length > 10) {
          <mat-divider></mat-divider>
          <div class="notification-footer">
            <button mat-button color="primary" routerLink="/notifications">
              View all ({{ notifications().length }})
            </button>
          </div>
        }
      }
    </mat-menu>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
    
    .notification-btn {
      color: inherit;
    }
    
    ::ng-deep .notification-menu {
      width: 360px;
      max-width: 90vw;
      
      .mat-mdc-menu-content {
        padding: 0;
      }
    }
    
    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      
      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }
    }
    
    .notification-list {
      max-height: 400px;
      overflow-y: auto;
    }
    
    .notification-item {
      display: flex;
      gap: 12px;
      padding: 12px 16px;
      cursor: pointer;
      transition: background-color 0.2s;
      border-left: 3px solid transparent;
      
      &:hover {
        background: var(--bg-hover, rgba(0,0,0,0.04));
      }
      
      &.unread {
        background: var(--brand-bg, rgba(124, 58, 237, 0.05));
        border-left-color: var(--brand, #7C3AED);
      }
      
      &.notification-success .notification-icon {
        color: var(--success, #10b981);
      }
      
      &.notification-error .notification-icon {
        color: var(--error, #ef4444);
      }
      
      &.notification-warning .notification-icon {
        color: var(--warning, #f59e0b);
      }
    }
    
    .notification-icon {
      flex-shrink: 0;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: var(--bg-tertiary, #f0f2f5);
      
      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }
    
    .notification-content {
      flex: 1;
      min-width: 0;
    }
    
    .notification-title {
      font-weight: 500;
      margin-bottom: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .notification-message {
      font-size: 13px;
      color: var(--text-secondary, #64748b);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .notification-time {
      font-size: 11px;
      color: var(--text-muted, #94a3b8);
      margin-top: 4px;
    }
    
    .empty-state {
      padding: 40px 20px;
      text-align: center;
      color: var(--text-muted, #94a3b8);
      
      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: 8px;
      }
      
      p {
        margin: 0;
      }
    }
    
    .notification-footer {
      padding: 8px;
      text-align: center;
    }
  `]
})
export class NotificationBellComponent {
  private notificationService = inject(NotificationService);

  notifications = this.notificationService.notifications;
  unreadCount = this.notificationService.unreadCount;

  getIcon(type: string): string {
    switch (type) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      case 'warning': return 'warning';
      default: return 'info';
    }
  }

  formatTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  }

  onNotificationClick(notification: Notification): void {
    this.notificationService.markAsRead(notification.id);
    // Navigate if actionUrl is provided
    if (notification.actionUrl) {
      // Router navigation would go here
    }
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }
}
