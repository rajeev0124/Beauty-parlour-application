import { Injectable, signal, OnDestroy } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  data?: any;
  actionUrl?: string;
  timestamp: Date;
  read: boolean;
}

/**
 * Notification service with optional WebSocket support
 * Falls back to polling if socket.io-client is not available
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService implements OnDestroy {
  private socket: any = null;
  private readonly baseUrl = environment.apiUrl.replace('/api', '');

  // Reactive state
  notifications = signal<Notification[]>([]);
  unreadCount = signal<number>(0);
  isConnected = signal<boolean>(false);

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    // Auto-connect when user logs in
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.connect();
      } else {
        this.disconnect();
      }
    });
  }

  /**
   * Connect to WebSocket server (if socket.io-client is available)
   */
  async connect(): Promise<void> {
    if (this.socket?.connected) return;

    const token = this.authService.getToken();
    if (!token) return;

    try {
      // Dynamic import to handle case when socket.io-client is not installed
      // @ts-ignore - socket.io-client may not be installed
      const socketModule = await import(/* webpackIgnore: true */ 'socket.io-client').catch(() => null);
      
      if (!socketModule) {
        console.warn('Socket.io-client not available, real-time notifications disabled');
        this.isConnected.set(false);
        return;
      }
      
      const { io } = socketModule;
      
      this.socket = io(`${this.baseUrl}/notifications`, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.setupListeners();
    } catch (error) {
      console.warn('Socket.io-client not available, notifications will be limited');
      this.isConnected.set(false);
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected.set(false);
    }
  }

  /**
   * Setup event listeners
   */
  private setupListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Notifications connected');
      this.isConnected.set(true);
    });

    this.socket.on('disconnect', () => {
      console.log('Notifications disconnected');
      this.isConnected.set(false);
    });

    this.socket.on('connected', (data: any) => {
      console.log('Notification service ready:', data);
    });

    // Generic notification handler
    this.socket.on('notification', (data: any) => {
      this.handleNotification(data);
    });

    // Specific event handlers
    const events = [
      'appointment:created',
      'appointment:updated',
      'appointment:cancelled',
      'appointment:confirmed',
      'appointment:reminder',
      'order:created',
      'order:statusChanged',
      'payment:received',
      'payment:failed',
      'inventory:lowStock',
      'loyalty:pointsEarned',
      'loyalty:tierUpgraded',
      'system:announcement',
    ];

    events.forEach(event => {
      this.socket!.on(event, (data: any) => {
        this.handleNotification({ ...data, event });
      });
    });
  }

  /**
   * Handle incoming notification
   */
  private handleNotification(data: any): void {
    const notification: Notification = {
      id: Date.now().toString(),
      title: data.title || 'Notification',
      message: data.message || '',
      type: data.type || 'info',
      data: data.data,
      actionUrl: data.actionUrl,
      timestamp: new Date(data.timestamp || Date.now()),
      read: false,
    };

    // Add to notifications list
    this.notifications.update(list => [notification, ...list].slice(0, 50));
    this.unreadCount.update(count => count + 1);

    // Show snackbar for important notifications
    if (data.type === 'success' || data.type === 'error' || data.type === 'warning') {
      this.showSnackbar(notification);
    }
  }

  /**
   * Show snackbar notification
   */
  private showSnackbar(notification: Notification): void {
    const panelClass = {
      'success': 'snackbar-success',
      'error': 'snackbar-error',
      'warning': 'snackbar-warning',
      'info': 'snackbar-info',
    }[notification.type];

    this.snackBar.open(notification.message, 'Close', {
      duration: 5000,
      panelClass: [panelClass],
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }

  /**
   * Mark notification as read
   */
  markAsRead(id: string): void {
    this.notifications.update(list => 
      list.map(n => n.id === id ? { ...n, read: true } : n)
    );
    this.updateUnreadCount();
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): void {
    this.notifications.update(list => 
      list.map(n => ({ ...n, read: true }))
    );
    this.unreadCount.set(0);
  }

  /**
   * Clear all notifications
   */
  clearAll(): void {
    this.notifications.set([]);
    this.unreadCount.set(0);
  }

  /**
   * Update unread count
   */
  private updateUnreadCount(): void {
    const unread = this.notifications().filter(n => !n.read).length;
    this.unreadCount.set(unread);
  }

  /**
   * Subscribe to a custom room
   */
  subscribe(room: string): void {
    this.socket?.emit('subscribe', { room });
  }

  /**
   * Unsubscribe from a custom room
   */
  unsubscribe(room: string): void {
    this.socket?.emit('unsubscribe', { room });
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
