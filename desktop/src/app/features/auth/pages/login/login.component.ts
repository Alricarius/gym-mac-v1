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
        <mat-icon class="login-icon">fitness_center</mat-icon>
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
            <mat-icon matSuffix>email</mat-icon>
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .login-card {
      background: white;
      border-radius: 12px;
      padding: 40px;
      width: 400px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      text-align: center;
    }

    .login-icon {
      font-size: 48px !important;
      width: 48px !important;
      height: 48px !important;
      color: #667eea;
      margin-bottom: 8px;
    }

    h1 {
      margin: 0 0 4px;
      font-size: 24px;
      color: #1a1a2e;
    }

    .subtitle {
      color: #666;
      margin: 0 0 24px;
      font-size: 14px;
    }

    :host ::ng-deep .mat-mdc-form-field { margin-bottom: 16px; }

    .error-msg {
      color: #e74c3c;
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
