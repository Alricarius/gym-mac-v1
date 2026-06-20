import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { BranchService } from '../../services/branch.service';
import { Branch } from '../../../../core/services/branch-store.service';

@Component({
  selector: 'app-branch-list',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatCardModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Sucursales</h1>
        <button mat-raised-button color="primary" (click)="create()">
          <mat-icon>add</mat-icon>
          Nueva sucursal
        </button>
      </div>

      <mat-card class="!rounded-xl !shadow-sm">
        <mat-card-content class="!p-6">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-200">
                  <th class="text-left font-semibold text-gray-500 uppercase text-xs tracking-wider py-3 px-4">Nombre</th>
                  <th class="text-left font-semibold text-gray-500 uppercase text-xs tracking-wider py-3 px-4">Dirección</th>
                  <th class="text-left font-semibold text-gray-500 uppercase text-xs tracking-wider py-3 px-4">Teléfono</th>
                  <th class="text-left font-semibold text-gray-500 uppercase text-xs tracking-wider py-3 px-4">Estado</th>
                  <th class="text-left font-semibold text-gray-500 uppercase text-xs tracking-wider py-3 px-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (branch of branches(); track branch.id) {
                  <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td class="py-3 px-4 font-medium text-gray-800">{{ branch.name }}</td>
                    <td class="py-3 px-4 text-gray-500">{{ branch.address || '-' }}</td>
                    <td class="py-3 px-4 text-gray-500">{{ branch.phone || '-' }}</td>
                    <td class="py-3 px-4">
                      <span class="badge badge-{{ branch.isActive ? 'active' : 'inactive' }}">
                        {{ branch.isActive ? 'Activa' : 'Inactiva' }}
                      </span>
                    </td>
                    <td class="py-3 px-4">
                      <button mat-stroked-button (click)="edit(branch)">Editar</button>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="5" class="empty">No hay sucursales registradas</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class BranchListComponent implements OnInit {
  private readonly branchService = inject(BranchService);
  private readonly router = inject(Router);

  readonly branches = signal<Branch[]>([]);

  ngOnInit(): void { this.loadBranches(); }

  loadBranches(): void {
    this.branchService.findAll().subscribe({
      next: (data) => this.branches.set(data),
    });
  }

  create(): void { this.router.navigate(['/branches/new']); }
  edit(branch: Branch): void { this.router.navigate(['/branches', branch.id]); }
}
