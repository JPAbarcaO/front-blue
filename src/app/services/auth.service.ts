import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
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

  private apiUrl = 'http://localhost:3000/api/auth';
  private tokenKey = 'token';

  constructor() {}

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
    return new Observable(observer => {
      const userData: User = { email, name, password };
      
      // Simulamos una llamada al backend
      setTimeout(() => {
        try {
          const existingUsers = localStorage.getItem('users');
          const users = existingUsers ? JSON.parse(existingUsers) : [];
          
          // Verificar si el usuario ya existe
          if (users.some((u: User) => u.email === email)) {
            observer.next({
              success: false,
              message: 'El usuario ya existe'
            });
            observer.complete();
            return;
          }

          // Guardar nuevo usuario
          users.push(userData);
          localStorage.setItem('users', JSON.stringify(users));
          
          // Auto-login
          const userWithoutPassword = { email, name };
          localStorage.setItem('user', JSON.stringify(userWithoutPassword));
          this.currentUser.next(userWithoutPassword);
          this.isAuthenticated.next(true);

          const token = 'fake-token-' + email;
          this.saveToken(token);

          observer.next({
            success: true,
            message: 'Usuario registrado exitosamente',
            user: userWithoutPassword,
            token
          });
        } catch (error) {
          observer.next({
            success: false,
            message: 'Error en el registro'
          });
        }
        observer.complete();
      }, 500);
    });
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return new Observable(observer => {
      setTimeout(() => {
        const existingUsers = localStorage.getItem('users');
        const users = existingUsers ? JSON.parse(existingUsers) : [];
        
        const user = users.find((u: User) => u.email === email && u.password === password);
        
        if (user) {
          const userWithoutPassword = { email: user.email, name: user.name };
          localStorage.setItem('user', JSON.stringify(userWithoutPassword));
          this.currentUser.next(userWithoutPassword);
          this.isAuthenticated.next(true);

          const token = 'fake-token-' + email;
          this.saveToken(token);

          observer.next({
            success: true,
            message: 'Login exitoso',
            user: userWithoutPassword,
            token
          });
        } else {
          observer.next({
            success: false,
            message: 'Email o contraseña inválidos'
          });
        }
        observer.complete();
      }, 500);
    });
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
}
