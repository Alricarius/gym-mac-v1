import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { TokenService } from './token.service';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  user: UserResponse;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = 'http://localhost:3000/api/v1/auth';

  constructor(
    private readonly http: HttpClient,
    private readonly tokenService: TokenService,
  ) {}

  login(credentials: LoginRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((res) => this.tokenService.setTokens(res.accessToken, res.refreshToken)),
    );
  }

  refresh(): Observable<TokenResponse> {
    const refreshToken = this.tokenService.getRefreshToken();
    return this.http
      .post<TokenResponse>(`${this.apiUrl}/refresh`, { refreshToken })
      .pipe(tap((res) => this.tokenService.setTokens(res.accessToken, res.refreshToken)));
  }

  logout(): void {
    const refreshToken = this.tokenService.getRefreshToken();
    if (refreshToken) {
      this.http.post(`${this.apiUrl}/logout`, { refreshToken }).subscribe({
        error: () => {},
      });
    }
    this.tokenService.clearTokens();
  }

  getProfile(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/me`);
  }

  isLoggedIn(): boolean {
    return this.tokenService.hasToken();
  }
}
