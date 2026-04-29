import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  getAllCustomers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}?role=customer`);
  }

  create(user: Partial<User>): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  update(id: string, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getUserOrders(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/orders`);
  }

  getUserAppointments(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/appointments`);
  }

  toggleStatus(id: string, status: 'active' | 'blocked'): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, { status });
  }
}
