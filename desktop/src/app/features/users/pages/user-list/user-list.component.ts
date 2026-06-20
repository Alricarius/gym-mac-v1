import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { UserService, SystemUser } from '../../services/user.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatCardModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Usuarios del sistema</h1>
        <button mat-raised-button color="primary" (click)="create()">
          <mat-icon>add</mat-icon>
          Nuevo usuario
        </button>
      </div>

      <mat-card class="!rounded-xl !shadow-sm">
        <mat-card-content class="!p-6">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-200">
                  <th class="text-left font-semibold text-gray-500 uppercase text-xs tracking-wider py-3 px-4">Nombre</th>
                  <th class="text-left font-semibold text-gray-500 uppercase text-xs tracking-wider py-3 px-4">Email</th>
                  <th class="text-left font-semibold text-gray-500 uppercase text-xs tracking-wider py-3 px-4">Rol</th>
                  <th class="text-left font-semibold text-gray-500 uppercase text-xs tracking-wider py-3 px-4">Estado</th>
                  <th class="text-left font-semibold text-gray-500 uppercase text-xs tracking-wider py-3 px-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (user of users(); track user.id) {
                  <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td class="py-3 px-4 font-medium text-gray-800">{{ user.fullName }}</td>
                    <td class="py-3 px-4 text-gray-500">{{ user.email }}</td>
                    <td class="py-3 px-4">
                      <span class="badge badge-{{ user.role }}">
                        {{ user.role === 'admin' ? 'Admin' : user.role === 'receptionist' ? 'Recepcionista' : 'Instructor' }}
                      </span>
                    </td>
                    <td class="py-3 px-4">
                      <span class="badge badge-{{ user.isActive ? 'active' : 'inactive' }}">
                        {{ user.isActive ? 'Activo' : 'Inactivo' }}
                      </span>
                    </td>
                    <td class="py-3 px-4">
                      <button mat-stroked-button class="!mr-2" (click)="edit(user)">Editar</button>
                      <button mat-stroked-button color="warn" (click)="delete(user)">Eliminar</button>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="5" class="empty">No hay usuarios registrados</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          @if (loading()) {
            <div class="loading">Cargando...</div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class UserListComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  readonly users = signal<SystemUser[]>([]);
  readonly loading = signal(false);

  ngOnInit(): void { this.loadUsers(); }

  loadUsers(): void {
    this.loading.set(true);
    this.userService.findAll().subscribe({
      next: (res) => { this.users.set(res); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  create(): void { this.router.navigate(['/users/new']); }
  edit(user: SystemUser): void { this.router.navigate(['/users', user.id]); }
  delete(user: SystemUser): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Eliminar usuario', message: `¿Eliminar a ${user.fullName}?` },
    });
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) this.userService.remove(user.id).subscribe(() => this.loadUsers());
    });
  }
}
