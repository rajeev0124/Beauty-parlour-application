import {
  ApplicationConfig,
  APP_INITIALIZER,
  provideBrowserGlobalErrorListeners,
  ErrorHandler,
} from '@angular/core';
import { provideRouter, withInMemoryScrolling, withPreloading, PreloadAllModules } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

import { routes } from './app.routes';
import { FirebaseService } from './core/services/firebase.service';
import { GlobalErrorHandler } from './core/services/error-handler.service';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

// Factory that eagerly initializes Firebase on app startup
function initializeFirebase(firebaseService: FirebaseService) {
  return () => firebaseService.getApp();
}

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'top' }),
      withPreloading(PreloadAllModules)
    ),
    provideHttpClient(),
    provideNoopAnimations(),
    provideCharts(withDefaultRegisterables()),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeFirebase,
      deps: [FirebaseService],
      multi: true,
    },
    provideClientHydration(withEventReplay()),
  ],
};
