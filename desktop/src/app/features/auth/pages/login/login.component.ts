import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { AuthStore } from '../../services/auth.store';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <mat-icon class="login-icon" aria-hidden="true">fitness_center</mat-icon>
        <h1>GymAdmin</h1>
        <p class="subtitle">Inicia sesión para continuar</p>

        <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Email</mat-label>
            <input
              matInput
              type="email"
              [(ngModel)]="email"
              name="email"
              required
              placeholder="admin@admin.com"
              autocomplete="email"
            />
            <button matSuffix mat-icon-button type="button" tabindex="-1" aria-hidden="true">
              <mat-icon>email</mat-icon>
            </button>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Contraseña</mat-label>
            <input
              matInput
              [type]="hidePassword ? 'password' : 'text'"
              [(ngModel)]="password"
              name="password"
              required
              placeholder="••••••••"
              autocomplete="current-password"
            />
            <button matSuffix mat-icon-button type="button" (click)="hidePassword = !hidePassword">
              <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
          </mat-form-field>

          <button mat-raised-button color="primary" type="submit" [disabled]="loading" class="w-full !py-3 !text-base">
            {{ loading ? 'Ingresando...' : 'Ingresar' }}
          </button>

          @if (error) {
            <p class="error-msg">{{ error }}</p>
          }
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: var(--color-primary);
      position: relative;
      overflow: hidden;
    }

    .login-container::before {
      content: '';
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at 20% 50%, rgba(255,255,255,0.06) 0%, transparent 50%),
                  radial-gradient(circle at 80% 50%, rgba(255,255,255,0.04) 0%, transparent 50%);
    }

    .login-card {
      background: var(--color-surface);
      border-radius: var(--radius-xl);
      padding: 2.5rem;
      width: 400px;
      box-shadow: 0 20px 60px rgba(79, 70, 229, 0.2);
      text-align: center;
      position: relative;
    }

    .login-icon {
      font-size: 48px !important;
      width: 48px !important;
      height: 48px !important;
      color: var(--color-primary);
      margin-bottom: 8px;
    }

    h1 {
      margin: 0 0 4px;
      font-size: 24px;
      color: var(--color-text-primary);
    }

    .subtitle {
      color: var(--color-text-secondary);
      margin: 0 0 24px;
      font-size: 14px;
    }

    :host ::ng-deep .mat-mdc-form-field { margin-bottom: 16px; }

    .error-msg {
      color: var(--color-error-text);
      font-size: 13px;
      margin-top: 16px;
    }
  `],
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  email = 'admin@admin.com';
  password = 'Admin123';
  hidePassword = true;
  loading = false;
  error = '';

  onSubmit(): void {
    this.loading = true;
    this.error = '';

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.authStore.setUser(res.user);
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.error = 'Credenciales inválidas';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }
}
