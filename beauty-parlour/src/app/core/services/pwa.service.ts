import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs';

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

@Injectable({
  providedIn: 'root'
})
export class PwaService {
  private isBrowser: boolean;
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private installableSubject = new BehaviorSubject<boolean>(false);
  
  isInstallable$ = this.installableSubject.asObservable();
  isOnline$ = new BehaviorSubject<boolean>(true);
  isPwaInstalled$ = new BehaviorSubject<boolean>(false);

  constructor(private snackBar: MatSnackBar) {
    const platformId = inject(PLATFORM_ID);
    this.isBrowser = isPlatformBrowser(platformId);
    
    if (this.isBrowser) {
      this.initializePwa();
    }
  }

  private initializePwa(): void {
    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      this.installableSubject.next(true);
    });

    // Check if app is installed
    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.installableSubject.next(false);
      this.isPwaInstalled$.next(true);
      this.snackBar.open('App installed successfully!', 'Close', {
        duration: 3000,
      });
    });

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isPwaInstalled$.next(true);
    }

    // Listen for online/offline status
    this.isOnline$.next(navigator.onLine);
    
    window.addEventListener('online', () => {
      this.isOnline$.next(true);
      this.snackBar.open('You are back online', 'Close', {
        duration: 3000,
      });
    });

    window.addEventListener('offline', () => {
      this.isOnline$.next(false);
      this.snackBar.open('You are offline. Some features may be limited.', 'Close', {
        duration: 5000,
      });
    });

    // Check for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.promptUpdate();
              }
            });
          }
        });
      });
    }
  }

  private promptUpdate(): void {
    const snackBarRef = this.snackBar.open(
      'A new version is available!',
      'Update',
      {
        duration: 10000,
      }
    );

    snackBarRef.onAction().subscribe(() => {
      window.location.reload();
    });
  }

  async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    try {
      await this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        this.deferredPrompt = null;
        this.installableSubject.next(false);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error prompting install:', error);
      return false;
    }
  }

  checkForUpdate(): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.update();
      });
    }
  }

  get isStandalone(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches;
  }

  get isServiceWorkerEnabled(): boolean {
    return 'serviceWorker' in navigator;
  }
}
