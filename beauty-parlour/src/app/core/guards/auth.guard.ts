import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { WakeupService } from '../services/wakeup.service';
import { map, filter, take, timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  return true;
};

export const adminGuard: CanActivateFn = () => {
  return true;
};

/**
 * Blocks navigation to any backend-dependent page until the server is online.
 * If the server is waking up (cold start), waits up to 2 minutes for it.
 * If it stays offline, redirects to home with a notice.
 */
export const serverReadyGuard: CanActivateFn = () => {
  const wakeupService = inject(WakeupService);
  const router = inject(Router);

  // Already online — pass through immediately
  if (wakeupService.isOnline) {
    return true;
  }

  // Server is waking up — wait for it to come online (or timeout)
  return wakeupService.status$.pipe(
    filter(status => status === 'online' || status === 'offline'),
    take(1),
    map(status => {
      if (status === 'online') {
        return true;
      }
      // Server failed to wake — go back to home
      router.navigate(['/']);
      return false;
    }),
    timeout(125000), // 125s safety net (matches 2-min poll window)
    catchError(() => {
      router.navigate(['/']);
      return of(false);
    })
  );
};
