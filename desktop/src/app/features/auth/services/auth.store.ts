import { Injectable, signal } from '@angular/core';
import { UserResponse } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  readonly user = signal<UserResponse | null>(null);
  readonly isAuthenticated = signal(false);

  setUser(user: UserResponse): void {
    this.user.set(user);
    this.isAuthenticated.set(true);
  }

  clear(): void {
    this.user.set(null);
    this.isAuthenticated.set(false);
  }
}
