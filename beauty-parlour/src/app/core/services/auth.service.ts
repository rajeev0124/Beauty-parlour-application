import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of, tap, delay, catchError, throwError } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models/user.model';
import { environment } from '../../../environments/environment';

// Demo users for offline/development mode
const DEMO_USERS: Record<string, { password: string; user: User }> = {
  // Admin users
  'admin@beauty.com': {
    password: 'admin123',
    user: {
      _id: 'demo-admin-001',
      name: 'Admin Kumar',
      email: 'admin@beauty.com',
      phone: '9876543210',
      role: 'admin',
      status: 'active',
      createdAt: new Date()
    }
  },
  'superadmin@beauty.com': {
    password: 'super123',
    user: {
      _id: 'demo-sa-001',
      name: 'Super Admin',
      email: 'superadmin@beauty.com',
      phone: '9876543211',
      role: 'superadmin',
      status: 'active',
      createdAt: new Date()
    }
  },
  // Customer users
  'customer@beauty.com': {
    password: 'customer123',
    user: {
      _id: 'demo-cust-001',
      name: 'Test Customer',
      email: 'customer@beauty.com',
      phone: '9876543212',
      role: 'customer',
      status: 'active',
      createdAt: new Date()
    }
  },
  'priya@gmail.com': {
    password: 'customer123',
    user: {
      _id: 'demo-cust-002',
      name: 'Priya Sharma',
      email: 'priya@gmail.com',
      phone: '9876543001',
      role: 'customer',
      status: 'active',
      createdAt: new Date()
    }
  },
  'sneha@gmail.com': {
    password: 'customer123',
    user: {
      _id: 'demo-cust-003',
      name: 'Sneha Reddy',
      email: 'sneha@gmail.com',
      phone: '9876543002',
      role: 'customer',
      status: 'active',
      createdAt: new Date()
    }
  }
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private demoMode = false; // Auto-switches to demo if backend unavailable
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    const stored = localStorage.getItem('user');
    if (stored) {
      this.currentUserSubject.next(JSON.parse(stored));
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    if (this.demoMode) {
      return this.demoLogin(credentials);
    }
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => this.handleAuth(res)),
      catchError((error: HttpErrorResponse) => {
        // If backend is unavailable, try demo mode
        if (error.status === 0) {
          console.warn('Backend unavailable, trying demo mode...');
          return this.demoLogin(credentials);
        }
        return throwError(() => error);
      })
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    if (this.demoMode) {
      return this.demoRegister(data, 'admin');
    }
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap(res => this.handleAuth(res)),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 0) {
          console.warn('Backend unavailable, trying demo mode...');
          return this.demoRegister(data, 'admin');
        }
        return throwError(() => error);
      })
    );
  }

  registerCustomer(data: RegisterRequest): Observable<AuthResponse> {
    if (this.demoMode) {
      return this.demoRegister(data, 'customer');
    }
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, { ...data, role: 'customer' }).pipe(
      tap(res => this.handleAuth(res)),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 0) {
          console.warn('Backend unavailable, trying demo mode...');
          return this.demoRegister(data, 'customer');
        }
        return throwError(() => error);
      })
    );
  }

  private demoLogin(credentials: LoginRequest): Observable<AuthResponse> {
    const demoUser = DEMO_USERS[credentials.email.toLowerCase()];
    if (demoUser && demoUser.password === credentials.password) {
      const response: AuthResponse = {
        accessToken: 'demo-token-' + Date.now(),
        refreshToken: 'demo-refresh-' + Date.now(),
        user: demoUser.user
      };
      return of(response).pipe(delay(300), tap(res => this.handleAuth(res)));
    }
    // Return observable error instead of throwing
    return throwError(() => ({ 
      error: { message: 'Invalid email or password' },
      status: 401 
    }));
  }

  private demoRegister(data: RegisterRequest, role: 'admin' | 'customer' = 'admin'): Observable<AuthResponse> {
    // Check if email already exists in demo users
    if (DEMO_USERS[data.email.toLowerCase()]) {
      return throwError(() => ({ 
        error: { message: 'Email already registered' },
        status: 409 
      }));
    }
    
    const response: AuthResponse = {
      accessToken: 'demo-token-' + Date.now(),
      refreshToken: 'demo-refresh-' + Date.now(),
      user: {
        _id: 'demo-' + Date.now(),
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: role,
        status: 'active',
        createdAt: new Date()
      }
    };
    return of(response).pipe(delay(300), tap(res => this.handleAuth(res)));
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  /**
   * Refresh the access token using the refresh token
   * Call this when access token expires (401 error)
   */
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => ({ message: 'No refresh token available' }));
    }

    if (this.demoMode || refreshToken.startsWith('demo-')) {
      // In demo mode, just generate a new demo token
      const currentUser = this.getCurrentUser();
      if (currentUser) {
        const response: AuthResponse = {
          accessToken: 'demo-token-' + Date.now(),
          refreshToken: 'demo-refresh-' + Date.now(),
          user: currentUser
        };
        return of(response).pipe(delay(100), tap(res => this.handleAuth(res)));
      }
      return throwError(() => ({ message: 'Session expired' }));
    }

    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh-token`, { refreshToken }).pipe(
      tap(res => this.handleAuth(res)),
      catchError((error: HttpErrorResponse) => {
        // If refresh fails, logout the user
        this.logout();
        return throwError(() => error);
      })
    );
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: string): boolean {
    return this.currentUserSubject.value?.role === role;
  }

  /**
   * Update the current user's data in localStorage and BehaviorSubject
   * Used when profile is updated (e.g., profile photo change)
   */
  updateCurrentUser(userData: Partial<User>): void {
    const currentUser = this.currentUserSubject.value;
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      this.currentUserSubject.next(updatedUser);
    }
  }

  private handleAuth(res: AuthResponse): void {
    localStorage.setItem('accessToken', res.accessToken);
    localStorage.setItem('refreshToken', res.refreshToken);
    localStorage.setItem('user', JSON.stringify(res.user));
    this.currentUserSubject.next(res.user);
  }

  /**
   * Request password reset - sends email with reset link
   */
  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/forgot-password`, { email });
  }

  /**
   * Reset password with token from email
   */
  resetPassword(token: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/reset-password`, { token, newPassword });
  }
}
