import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../features/auth/services/auth.service';
import { AuthStore } from '../../features/auth/services/auth.store';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    MatToolbarModule, MatListModule, MatIconModule, MatButtonModule,
  ],
  template: `
    <div class="flex h-screen">
      <aside class="w-60 bg-gray-900 text-white flex flex-col">
        <mat-toolbar class="bg-gray-900 text-white border-b border-white/10">
          <span class="text-lg font-medium">GymAdmin</span>
        </mat-toolbar>

        <mat-nav-list class="flex-1 px-3 pt-2">
          <a mat-list-item routerLink="/dashboard" routerLinkActive="active"
             class="text-white/70 hover:text-white rounded-lg mb-0.5">
            <mat-icon class="mr-3 text-lg">dashboard</mat-icon>
            <span>Dashboard</span>
          </a>
          <a mat-list-item routerLink="/members" routerLinkActive="active"
             class="text-white/70 hover:text-white rounded-lg mb-0.5">
            <mat-icon class="mr-3 text-lg">people</mat-icon>
            <span>Miembros</span>
          </a>
          <a mat-list-item routerLink="/plans" routerLinkActive="active"
             class="text-white/70 hover:text-white rounded-lg mb-0.5">
            <mat-icon class="mr-3 text-lg">subscriptions</mat-icon>
            <span>Planes</span>
          </a>
          <a mat-list-item routerLink="/subscriptions" routerLinkActive="active"
             class="text-white/70 hover:text-white rounded-lg mb-0.5">
            <mat-icon class="mr-3 text-lg">assignment</mat-icon>
            <span>Suscripciones</span>
          </a>
          <a mat-list-item routerLink="/classes" routerLinkActive="active"
             class="text-white/70 hover:text-white rounded-lg mb-0.5">
            <mat-icon class="mr-3 text-lg">fitness_center</mat-icon>
            <span>Clases</span>
          </a>
          <a mat-list-item routerLink="/bookings" routerLinkActive="active"
             class="text-white/70 hover:text-white rounded-lg mb-0.5">
            <mat-icon class="mr-3 text-lg">calendar_month</mat-icon>
            <span>Reservas</span>
          </a>
          <a mat-list-item routerLink="/check-in" routerLinkActive="active"
             class="text-white/70 hover:text-white rounded-lg mb-0.5">
            <mat-icon class="mr-3 text-lg">login</mat-icon>
            <span>Check-in</span>
          </a>
          <a mat-list-item routerLink="/payments" routerLinkActive="active"
             class="text-white/70 hover:text-white rounded-lg mb-0.5">
            <mat-icon class="mr-3 text-lg">payments</mat-icon>
            <span>Pagos</span>
          </a>
          <a mat-list-item routerLink="/reports" routerLinkActive="active"
             class="text-white/70 hover:text-white rounded-lg mb-0.5">
            <mat-icon class="mr-3 text-lg">bar_chart</mat-icon>
            <span>Reportes</span>
          </a>
        </mat-nav-list>

        <div class="p-4 border-t border-white/10">
          <span class="block text-sm text-white/80 mb-2">{{ authStore.user()?.fullName }}</span>
          <button mat-flat-button class="!bg-white/10 !text-white w-full text-sm" (click)="logout()">
            <mat-icon class="mr-2 text-lg">logout</mat-icon>
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main class="flex-1 bg-gray-50 overflow-y-auto">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .active { background: rgba(255,255,255,0.1) !important; color: white !important; }
    .mdc-list-item { border-radius: 8px !important; }
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
