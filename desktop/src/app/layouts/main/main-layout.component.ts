import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';
import { AuthStore } from '../../features/auth/services/auth.store';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="sidebar-header">
          <h2>GymAdmin</h2>
        </div>
        <nav class="sidebar-nav">
          <a class="nav-item" routerLink="/dashboard" routerLinkActive="active">
            Dashboard
          </a>
          <a class="nav-item" routerLink="/members" routerLinkActive="active">
            Miembros
          </a>
          <a class="nav-item" routerLink="/plans" routerLinkActive="active">
            Planes
          </a>
          <a class="nav-item" routerLink="/subscriptions" routerLinkActive="active">
            Suscripciones
          </a>
          <a class="nav-item" routerLink="/payments" routerLinkActive="active">
            Pagos
          </a>
        </nav>
        <div class="sidebar-footer">
          <span class="user-name">{{ authStore.user()?.fullName }}</span>
          <button class="btn-logout" (click)="logout()">Cerrar sesión</button>
        </div>
      </aside>
      <main class="main-content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .app-shell {
      display: flex;
      height: 100vh;
    }

    .sidebar {
      width: 240px;
      background: #1a1a2e;
      color: white;
      display: flex;
      flex-direction: column;
    }

    .sidebar-header {
      padding: 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .sidebar-header h2 {
      margin: 0;
      font-size: 18px;
    }

    .sidebar-nav {
      flex: 1;
      padding: 12px;
    }

    .nav-item {
      display: block;
      padding: 10px 14px;
      color: rgba(255, 255, 255, 0.7);
      text-decoration: none;
      border-radius: 8px;
      margin-bottom: 4px;
      font-size: 14px;
      transition: all 0.2s;
    }

    .nav-item:hover, .nav-item.active {
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }

    .sidebar-footer {
      padding: 16px 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .user-name {
      display: block;
      font-size: 13px;
      margin-bottom: 8px;
      color: rgba(255, 255, 255, 0.8);
    }

    .btn-logout {
      width: 100%;
      padding: 8px;
      background: rgba(255, 255, 255, 0.1);
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
    }

    .btn-logout:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .main-content {
      flex: 1;
      background: #f5f6fa;
      overflow-y: auto;
    }
  `],
})
export class MainLayoutComponent {
  readonly authStore = inject(AuthStore);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  logout(): void {
    this.authService.logout();
    this.authStore.clear();
    this.router.navigate(['/login']);
  }
}
