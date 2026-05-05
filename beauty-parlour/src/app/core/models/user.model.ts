import { Staff } from './staff.model';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin' | 'superadmin' | 'staff';
  profileImage?: string;
  address?: string;
  status: 'active' | 'blocked';
  assignedStaff?: Staff[];
  createdAt: Date;
  is2FAEnabled?: boolean;
  activeSessions?: any[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}
