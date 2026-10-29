import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ClassService, GymClass } from '../../services/class.service';

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

@Component({
  selector: 'app-class-list',
  standalone: true,
  imports: [
    FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule,
    MatIconModule, MatPaginatorModule, MatCardModule,
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Clases</h1>
        <button mat-raised-button color="primary" (click)="create()">
          <mat-icon>add</mat-icon>
          Nueva clase
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
                  <th class="text-left font-semibold text-slate-500 uppercase text-xs tracking-wider py-3 px-4">Capacidad</th>
                  <th class="text-left font-semibold text-slate-500 uppercase text-xs tracking-wider py-3 px-4">Horarios</th>
                  <th class="text-left font-semibold text-slate-500 uppercase text-xs tracking-wider py-3 px-4">Estado</th>
                  <th class="text-left font-semibold text-slate-500 uppercase text-xs tracking-wider py-3 px-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (c of classes(); track c.id) {
                  <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td class="py-3 px-4">
                      <span class="flex items-center gap-2 font-medium text-slate-800">
                        @if (c.color) {
                          <span class="inline-block w-3 h-3 rounded-full" [style.background]="c.color"></span>
                        }
                        {{ c.name }}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-slate-500">{{ c.capacity }}</td>
                    <td class="py-3 px-4 text-slate-500">
                        @if (c.schedules.length) {
                          <span class="text-xs space-x-1">
                            @for (s of c.schedules; track s.id) {
                              <span class="inline-block bg-slate-100 rounded px-1.5 py-0.5 mb-0.5">
                                {{ DAY_NAMES[s.dayOfWeek] }} {{ s.startTime.slice(0, 5) }}
                              </span>
                            }
                          </span>
                        } @else {
                          <span class="text-slate-500 italic">Sin horarios</span>
                        }
                    </td>
                    <td class="py-3 px-4">
                      <span class="badge badge-{{ c.isActive ? 'active' : 'inactive' }}">
                        {{ c.isActive ? 'Activa' : 'Inactiva' }}
                      </span>
                    </td>
                    <td class="py-3 px-4">
                      <button mat-stroked-button class="!mr-2" (click)="edit(c)">Editar</button>
                      <button mat-stroked-button color="warn" (click)="delete(c)">Eliminar</button>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="5" class="empty">No hay clases registradas</td>
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
export class ClassListComponent implements OnInit {
  readonly DAY_NAMES = DAY_NAMES;
  private readonly dialog = inject(MatDialog);
  private readonly classService = inject(ClassService);
  private readonly router = inject(Router);

  readonly classes = signal<GymClass[]>([]);
  readonly loading = signal(false);
  readonly page = signal(1);
  readonly total = signal(0);
  readonly totalPages = signal(1);
  searchTerm = '';

  ngOnInit(): void { this.loadClasses(); }

  loadClasses(): void {
    this.loading.set(true);
    this.classService.findAll(this.searchTerm || undefined, undefined, this.page()).subscribe({
      next: (res) => {
        this.classes.set(res.data);
        this.total.set(res.meta.total);
        this.totalPages.set(res.meta.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onSearch(): void { this.page.set(1); this.loadClasses(); }
  onPageChange(e: PageEvent): void { this.page.set(e.pageIndex + 1); this.loadClasses(); }
  create(): void { this.router.navigate(['/classes/new']); }
  edit(c: GymClass): void { this.router.navigate(['/classes', c.id]); }
  delete(c: GymClass): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Eliminar clase', message: `¿Eliminar la clase "${c.name}"?` },
    });
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) this.classService.remove(c.id).subscribe(() => this.loadClasses());
    });
  }
}
