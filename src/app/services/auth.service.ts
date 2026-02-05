import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of } from 'rxjs';
import { AuthResponse, User } from '@models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser = new BehaviorSubject<User | null>(
    this.loadUserFromStorage()
  );
  public currentUser$ = this.currentUser.asObservable();

  private isAuthenticated = new BehaviorSubject<boolean>(
    this.loadUserFromStorage() !== null
  );
  public isAuthenticated$ = this.isAuthenticated.asObservable();

  private apiUrl = 'http://localhost:3000/api/v1/auth';
  private tokenKey = 'token';

  constructor(private http: HttpClient) {}

  private loadUserFromStorage(): User | null {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  private saveToken(token?: string): void {
    if (typeof window === 'undefined') return;
    if (token) {
      localStorage.setItem(this.tokenKey, token);
    } else {
      localStorage.removeItem(this.tokenKey);
    }
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.tokenKey);
  }

  register(email: string, name: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<any>(`${this.apiUrl}/register`, { email, name, password })
      .pipe(
        map((response) => {
          const user = this.buildUserFromResponse(response, email, name);
          const token = this.extractToken(response);
          this.persistAuth(user, token);
          return {
            success: true,
            message: response?.message || 'Usuario registrado exitosamente',
            user,
            token
          };
        }),
        catchError((error) => {
          const message =
            error?.error?.message ||
            error?.message ||
            'Error en el registro';
          return of({ success: false, message });
        })
      );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<any>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        map((response) => {
          const user = this.buildUserFromResponse(response, email);
          const token = this.extractToken(response);
          this.persistAuth(user, token);
          return {
            success: true,
            message: response?.message || 'Login exitoso',
            user,
            token
          };
        }),
        catchError((error) => {
          const message =
            error?.error?.message ||
            error?.message ||
            'Email o contraseña inválidos';
          return of({ success: false, message });
        })
      );
  }

  logout(): void {
    localStorage.removeItem('user');
    this.saveToken();
    this.currentUser.next(null);
    this.isAuthenticated.next(false);
  }

  getCurrentUser(): User | null {
    return this.currentUser.value;
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated.value;
  }

  private extractToken(response: any): string | undefined {
    return (
      response?.token ||
      response?.accessToken ||
      response?.jwt ||
      response?.data?.token
    );
  }

  private buildUserFromResponse(
    response: any,
    fallbackEmail: string,
    fallbackName?: string
  ): User {
    const responseUser = response?.user || response?.data?.user || {};
    const email = responseUser?.email || response?.email || fallbackEmail;
    const name =
      responseUser?.name ||
      response?.name ||
      fallbackName ||
      email.split('@')[0];

    return { email, name };
  }

  private persistAuth(user: User, token?: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
    this.currentUser.next(user);
    this.isAuthenticated.next(true);
    this.saveToken(token);
  }
}
