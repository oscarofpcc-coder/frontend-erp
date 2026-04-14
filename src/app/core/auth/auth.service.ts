import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  sub: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  exp: number;
}

export interface UserInfo {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface LoginRequest {
  login: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _currentUser = signal<UserInfo | null>(this.loadUserFromToken());
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);

  private readonly apiUrl = 'http://localhost:3000/api';

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
  ) {}

  register(data: RegisterRequest): Observable<UserInfo> {
    return this.http.post<UserInfo>(`${this.apiUrl}/auth/register`, data);
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap((response) => {
        localStorage.setItem('access_token', response.accessToken);
        this._currentUser.set(this.decodeToken(response.accessToken));
      }),
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private loadUserFromToken(): UserInfo | null {
    const token = localStorage.getItem('access_token');
    if (!token) return null;
    try {
      const payload = jwtDecode<JwtPayload>(token);
      if (payload.exp * 1000 < Date.now()) {
        localStorage.removeItem('access_token');
        return null;
      }
      return this.mapPayloadToUser(payload);
    } catch {
      localStorage.removeItem('access_token');
      return null;
    }
  }

  private decodeToken(token: string): UserInfo | null {
    try {
      const payload = jwtDecode<JwtPayload>(token);
      return this.mapPayloadToUser(payload);
    } catch {
      return null;
    }
  }

  private mapPayloadToUser(payload: JwtPayload): UserInfo {
    return {
      id: payload.sub,
      username: payload.username,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
    };
  }
}
