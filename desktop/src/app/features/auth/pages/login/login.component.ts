import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AuthStore } from '../../services/auth.store';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h1>Gym Management</h1>
        <p class="subtitle">Inicia sesión para continuar</p>

        <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              type="email"
              [(ngModel)]="email"
              name="email"
              required
              placeholder="admin@admin.com"
              autocomplete="email"
            />
          </div>

          <div class="form-group">
            <label for="password">Contraseña</label>
            <input
              id="password"
              type="password"
              [(ngModel)]="password"
              name="password"
              required
              placeholder="••••••••"
              autocomplete="current-password"
            />
          </div>

          <button type="submit" [disabled]="loading" class="btn-primary">
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
    }

    h1 {
      margin: 0 0 4px;
      font-size: 24px;
      color: #1a1a2e;
    }

    .subtitle {
      color: #666;
      margin: 0 0 32px;
      font-size: 14px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      margin-bottom: 6px;
      font-size: 13px;
      font-weight: 600;
      color: #333;
    }

    input {
      width: 100%;
      padding: 10px 14px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 14px;
      box-sizing: border-box;
      transition: border-color 0.2s;
    }

    input:focus {
      outline: none;
      border-color: #667eea;
    }

    .btn-primary {
      width: 100%;
      padding: 12px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-primary:hover:not(:disabled) {
      background: #5a6fd6;
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .error-msg {
      color: #e74c3c;
      font-size: 13px;
      margin-top: 16px;
      text-align: center;
    }
  `],
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  email = 'admin@admin.com';
  password = 'Admin123';
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
