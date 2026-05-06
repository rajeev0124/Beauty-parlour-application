import { Injectable } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private app: FirebaseApp;

  constructor() {
    this.app = initializeApp(environment.firebaseConfig);
  }

  /**
   * Returns the initialized Firebase app instance.
   * Use this to get the app reference for other Firebase services
   * (e.g., getAuth(app), getFirestore(app), etc.)
   */
  getApp(): FirebaseApp {
    return this.app;
  }
}
