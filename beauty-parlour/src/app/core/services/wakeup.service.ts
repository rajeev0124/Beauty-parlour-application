import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, timer, of } from 'rxjs';
import { catchError, map, switchMap, tap, take } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';

export type ServerStatus = 'checking' | 'online' | 'waking' | 'offline';

@Injectable({ providedIn: 'root' })
export class WakeupService {
  private readonly healthUrl = `${environment.apiUrl.replace('/api', '')}/health`;

  private _status = new BehaviorSubject<ServerStatus>('checking');
  readonly status$ = this._status.asObservable();

  /** ms elapsed since wakeup started */
  private _elapsedSeconds = new BehaviorSubject<number>(0);
  readonly elapsedSeconds$ = this._elapsedSeconds.asObservable();

  private isBrowser: boolean;
  private timerSub: any;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  /** Call once at app startup. Pings health endpoint and manages wakeup state. */
  init(): Observable<boolean> {
    if (!this.isBrowser) {
      this._status.next('online');
      return of(true);
    }

    return this.ping().pipe(
      switchMap(online => {
        if (online) {
          this._status.next('online');
          return of(true);
        }
        // Backend is sleeping — start the wakeup process
        this._status.next('waking');
        this.startElapsedTimer();
        return this.pollUntilOnline();
      })
    );
  }

  /** Single ping — resolves true if backend responds */
  ping(): Observable<boolean> {
    return this.http.get(this.healthUrl, { responseType: 'json' }).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  get currentStatus(): ServerStatus {
    return this._status.value;
  }

  get isOnline(): boolean {
    return this._status.value === 'online';
  }

  private pollUntilOnline(): Observable<boolean> {
    // Poll every 5 seconds for up to 2 minutes
    return new Observable<boolean>(observer => {
      let attempts = 0;
      const maxAttempts = 24; // 24 × 5s = 2 min

      const poll = () => {
        if (attempts >= maxAttempts) {
          this._status.next('offline');
          this.stopElapsedTimer();
          observer.next(false);
          observer.complete();
          return;
        }
        attempts++;
        this.http.get(this.healthUrl, { responseType: 'json' }).pipe(
          map(() => true),
          catchError(() => of(false))
        ).subscribe(online => {
          if (online) {
            this._status.next('online');
            this.stopElapsedTimer();
            observer.next(true);
            observer.complete();
          } else {
            setTimeout(poll, 5000);
          }
        });
      };

      poll();
    });
  }

  private startElapsedTimer(): void {
    this._elapsedSeconds.next(0);
    let seconds = 0;
    this.timerSub = setInterval(() => {
      seconds++;
      this._elapsedSeconds.next(seconds);
    }, 1000);
  }

  private stopElapsedTimer(): void {
    if (this.timerSub) {
      clearInterval(this.timerSub);
      this.timerSub = null;
    }
  }
}
