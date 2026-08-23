import {
  ApplicationConfig,
  APP_INITIALIZER,
  provideBrowserGlobalErrorListeners,
  ErrorHandler,
} from '@angular/core';
import { WakeupService } from './core/services/wakeup.service';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { FirebaseService } from './core/services/firebase.service';
import { GlobalErrorHandler } from './core/services/error-handler.service';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

// Factory that eagerly initializes Firebase on app startup
function initializeFirebase(firebaseService: FirebaseService) {
  return () => firebaseService.getApp();
}

// Factory: ping backend on startup to detect Render cold starts
function initializeWakeup(wakeupService: WakeupService) {
  return () => wakeupService.init();
}

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideNoopAnimations(),
    provideCharts(withDefaultRegisterables()),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeFirebase,
      deps: [FirebaseService],
      multi: true,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeWakeup,
      deps: [WakeupService],
      multi: true,
    },
    provideClientHydration(withEventReplay()),
  ],
};
