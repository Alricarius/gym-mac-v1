import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MemberService, Member } from '../../services/member.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [
    FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule,
    MatIconModule, MatPaginatorModule, MatCardModule, MatDialogModule,
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Socios</h1>
        <button mat-raised-button color="primary" (click)="create()">
          <mat-icon>add</mat-icon>
          Nuevo socio
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
                  <th class="text-left font-semibold text-slate-500 uppercase text-xs tracking-wider py-3 px-4">Email</th>
                  <th class="text-left font-semibold text-slate-500 uppercase text-xs tracking-wider py-3 px-4">Teléfono</th>
                  <th class="text-left font-semibold text-slate-500 uppercase text-xs tracking-wider py-3 px-4">Estado</th>
                  <th class="text-left font-semibold text-slate-500 uppercase text-xs tracking-wider py-3 px-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (member of members(); track member.id) {
                  <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td class="py-3 px-4 font-medium text-slate-800">{{ member.fullName }}</td>
                    <td class="py-3 px-4 text-slate-500">{{ member.email || '-' }}</td>
                    <td class="py-3 px-4 text-slate-500">{{ member.phone || '-' }}</td>
                    <td class="py-3 px-4">
                      <span class="badge badge-{{ member.status }}">
                        {{ member.status === 'active' ? 'Activo' : 'Inactivo' }}
                      </span>
                    </td>
                    <td class="py-3 px-4">
                      <button mat-stroked-button class="!mr-2" (click)="edit(member)">Editar</button>
                      <button mat-stroked-button color="warn" (click)="delete(member)">Eliminar</button>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="5" class="empty">No hay socios registrados</td>
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
export class MemberListComponent implements OnInit {
  private readonly memberService = inject(MemberService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  readonly members = signal<Member[]>([]);
  readonly loading = signal(false);
  readonly page = signal(1);
  readonly total = signal(0);
  readonly totalPages = signal(1);
  searchTerm = '';

  ngOnInit(): void { this.loadMembers(); }

  loadMembers(): void {
    this.loading.set(true);
    this.memberService.findAll(this.searchTerm || undefined, this.page()).subscribe({
      next: (res) => {
        this.members.set(res.data);
        this.total.set(res.meta.total);
        this.totalPages.set(res.meta.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onSearch(): void { this.page.set(1); this.loadMembers(); }

  onPageChange(e: PageEvent): void {
    this.page.set(e.pageIndex + 1);
    this.loadMembers();
  }

  create(): void { this.router.navigate(['/members/new']); }
  edit(member: Member): void { this.router.navigate(['/members', member.id]); }
  delete(member: Member): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Eliminar socio', message: `¿Eliminar a ${member.fullName}?` },
    });
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) this.memberService.remove(member.id).subscribe(() => this.loadMembers());
    });
  }
}
