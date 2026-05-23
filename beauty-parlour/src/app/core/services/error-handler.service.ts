import { ErrorHandler, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    const errorString = error?.message || error?.toString() || 'Unknown Error';
    
    // Log to console for debugging
    console.error('🔥 Global Application Error:', error);

    // In a professional environment, this is where you would send the error to Sentry or Datadog
    // Example: Sentry.captureException(error);
  }
}
