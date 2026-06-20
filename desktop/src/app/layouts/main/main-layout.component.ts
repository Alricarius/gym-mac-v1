import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../features/auth/services/auth.service';
import { AuthStore } from '../../features/auth/services/auth.store';
import { NotificationToastService } from '../../features/notifications/services/notification-toast.service';
import { BranchStore } from '../../core/services/branch-store.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive, FormsModule,
    MatToolbarModule, MatListModule, MatIconModule, MatButtonModule,
    MatSelectModule, MatFormFieldModule,
  ],
  template: `
    <div class="flex h-screen">
      <aside class="w-60 bg-gray-900 text-white flex flex-col">
        <mat-toolbar class="bg-gray-900 text-white border-b border-white/10">
          <span class="text-lg font-medium">GymAdmin</span>
        </mat-toolbar>

        @if (branchStore.branches().length > 0) {
          <div class="px-3 pt-3 pb-1">
            <mat-form-field appearance="fill" class="w-full !mb-0" subscriptSizing="dynamic">
              <mat-select [value]="branchStore.selectedBranch()?.id"
                          (selectionChange)="onBranchChange($event.value)"
                          class="!text-white !text-sm">
                @for (b of branchStore.branches(); track b.id) {
                  <mat-option [value]="b.id">{{ b.name }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>
        }

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
          <a mat-list-item routerLink="/inventory" routerLinkActive="active"
             class="text-white/70 hover:text-white rounded-lg mb-0.5">
            <mat-icon class="mr-3 text-lg">inventory_2</mat-icon>
            <span>Inventario</span>
          </a>
          <a mat-list-item routerLink="/branches" routerLinkActive="active"
             class="text-white/70 hover:text-white rounded-lg mb-0.5">
            <mat-icon class="mr-3 text-lg">store</mat-icon>
            <span>Sucursales</span>
          </a>
          <a mat-list-item routerLink="/reports" routerLinkActive="active"
             class="text-white/70 hover:text-white rounded-lg mb-0.5">
            <mat-icon class="mr-3 text-lg">bar_chart</mat-icon>
            <span>Reportes</span>
          </a>
          @if (authStore.user()?.role === 'admin') {
            <a mat-list-item routerLink="/users" routerLinkActive="active"
               class="text-white/70 hover:text-white rounded-lg mb-0.5">
              <mat-icon class="mr-3 text-lg">manage_accounts</mat-icon>
              <span>Usuarios</span>
            </a>
            <a mat-list-item routerLink="/settings" routerLinkActive="active"
               class="text-white/70 hover:text-white rounded-lg mb-0.5">
              <mat-icon class="mr-3 text-lg">settings</mat-icon>
              <span>Configuración</span>
            </a>
          }
          <a mat-list-item routerLink="/notifications" routerLinkActive="active"
             class="text-white/70 hover:text-white rounded-lg mb-0.5">
            <mat-icon class="mr-3 text-lg">notifications</mat-icon>
            <span>Notificaciones</span>
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
    :host ::ng-deep .mat-mdc-select-value-text { color: white !important; }
    :host ::ng-deep .mat-mdc-select-arrow { color: rgba(255,255,255,0.7) !important; }
    :host ::ng-deep .mdc-line-ripple { display: none; }
    :host ::ng-deep .mat-mdc-form-field-focus-overlay { background: transparent; }
  `],
})
export class MainLayoutComponent implements OnInit {
  readonly authStore = inject(AuthStore);
  readonly branchStore = inject(BranchStore);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notificationToast = inject(NotificationToastService);

  ngOnInit(): void {
    this.branchStore.loadBranches();
  }

  onBranchChange(branchId: string): void {
    const branch = this.branchStore.branches().find((b) => b.id === branchId);
    if (branch) this.branchStore.selectBranch(branch);
  }

  logout(): void {
    this.authService.logout();
    this.authStore.clear();
    this.router.navigate(['/login']);
  }
}
