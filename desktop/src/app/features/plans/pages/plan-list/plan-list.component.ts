import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { PlanService, Plan } from '../../services/plan.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-plan-list',
  standalone: true,
  imports: [
    FormsModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule,
    MatIconModule, MatPaginatorModule, MatCardModule,
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Planes</h1>
        <button mat-raised-button color="primary" (click)="create()">
          <mat-icon>add</mat-icon>
          Nuevo plan
        </button>
      </div>

      <mat-card class="!rounded-xl !shadow-sm">
        <mat-card-content class="!p-6">
          <mat-form-field appearance="outline" class="w-full max-w-sm mb-4">
            <mat-label>Buscar por nombre</mat-label>
            <input matInput [(ngModel)]="searchTerm" (input)="onSearch()" placeholder="Escribí un nombre..." />
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-slate-200">
                  <th class="text-left font-semibold text-slate-500 uppercase text-xs tracking-wider py-3 px-4">Nombre</th>
                  <th class="text-left font-semibold text-slate-500 uppercase text-xs tracking-wider py-3 px-4">Duración</th>
                  <th class="text-left font-semibold text-slate-500 uppercase text-xs tracking-wider py-3 px-4">Precio</th>
                  <th class="text-left font-semibold text-slate-500 uppercase text-xs tracking-wider py-3 px-4">Clases</th>
                  <th class="text-left font-semibold text-slate-500 uppercase text-xs tracking-wider py-3 px-4">Activo</th>
                  <th class="text-left font-semibold text-slate-500 uppercase text-xs tracking-wider py-3 px-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (plan of plans(); track plan.id) {
                  <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td class="py-3 px-4 font-medium text-slate-800">{{ plan.name }}</td>
                    <td class="py-3 px-4 text-slate-500">{{ plan.duration }} días</td>
                    <td class="py-3 px-4 text-slate-500">{{ '$' + plan.price }}</td>
                    <td class="py-3 px-4 text-slate-500">{{ plan.classCount ?? 'Ilimitadas' }}</td>
                    <td class="py-3 px-4">
                      <span class="badge badge-{{ plan.isActive ? 'active' : 'inactive' }}">
                        {{ plan.isActive ? 'Sí' : 'No' }}
                      </span>
                    </td>
                    <td class="py-3 px-4">
                      <button mat-stroked-button class="!mr-2" (click)="edit(plan)">Editar</button>
                      <button mat-stroked-button color="warn" (click)="delete(plan)">Eliminar</button>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6" class="empty">No hay planes registrados</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          @if (totalPages() > 1) {
            <mat-paginator class="!mt-4"
              [length]="total()"
              [pageSize]="20"
              [pageIndex]="page() - 1"
              [pageSizeOptions]="[10, 20, 50]"
              (page)="onPageChange($event)"
              showFirstLastButtons>
            </mat-paginator>
          }

          @if (loading()) {
            <div class="loading">Cargando...</div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class PlanListComponent implements OnInit {
  private readonly planService = inject(PlanService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  readonly plans = signal<Plan[]>([]);
  readonly loading = signal(false);
  readonly page = signal(1);
  readonly total = signal(0);
  readonly totalPages = signal(1);
  searchTerm = '';

  ngOnInit(): void { this.loadPlans(); }

  loadPlans(): void {
    this.loading.set(true);
    this.planService.findAll(this.searchTerm || undefined, this.page()).subscribe({
      next: (res) => {
        this.plans.set(res.data);
        this.total.set(res.meta.total);
        this.totalPages.set(res.meta.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onSearch(): void { this.page.set(1); this.loadPlans(); }

  onPageChange(e: PageEvent): void {
    this.page.set(e.pageIndex + 1);
    this.loadPlans();
  }

  create(): void { this.router.navigate(['/plans/new']); }
  edit(plan: Plan): void { this.router.navigate(['/plans', plan.id]); }
  delete(plan: Plan): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Eliminar plan', message: `¿Eliminar el plan "${plan.name}"?` },
    });
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) this.planService.remove(plan.id).subscribe(() => this.loadPlans());
    });
  }
}
