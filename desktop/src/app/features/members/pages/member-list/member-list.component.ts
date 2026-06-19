import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MemberService, Member } from '../../services/member.service';

@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Socios</h1>
        <button class="btn-primary" (click)="create()">+ Nuevo socio</button>
      </div>

      <div class="search-bar">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          [(ngModel)]="searchTerm"
          (input)="onSearch()"
        />
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (member of members(); track member.id) {
              <tr>
                <td>{{ member.fullName }}</td>
                <td>{{ member.email || '-' }}</td>
                <td>{{ member.phone || '-' }}</td>
                <td>
                  <span [class]="'badge badge-' + member.status">
                    {{ member.status === 'active' ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td class="actions">
                  <button class="btn-sm" (click)="edit(member)">Editar</button>
                  <button class="btn-sm btn-danger" (click)="delete(member)">Eliminar</button>
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
        <div class="pagination">
          <button [disabled]="page() <= 1" (click)="goToPage(page() - 1)">Anterior</button>
          <span>Página {{ page() }} de {{ totalPages() }}</span>
          <button [disabled]="page() >= totalPages()" (click)="goToPage(page() + 1)">Siguiente</button>
        </div>
      }

      @if (loading()) {
        <div class="loading">Cargando...</div>
      }
    </div>
  `,
  styles: [`
    .page { padding: 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h1 { margin: 0; font-size: 22px; color: #1a1a2e; }
    .search-bar { margin-bottom: 16px; }
    .search-bar input { width: 100%; max-width: 400px; padding: 10px 14px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; box-sizing: border-box; }
    .search-bar input:focus { outline: none; border-color: #667eea; }
    .table-container { background: white; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); overflow: hidden; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 12px 16px; text-align: left; font-size: 14px; }
    th { background: #f8f9fc; color: #666; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    td { border-top: 1px solid #f0f0f0; }
    .empty { text-align: center; color: #999; padding: 40px !important; }
    .badge { padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; }
    .badge-active { background: #e8f5e9; color: #2e7d32; }
    .badge-inactive { background: #fbe9e7; color: #c62828; }
    .actions { display: flex; gap: 8px; }
    .btn-sm { padding: 6px 14px; border: 1px solid #ddd; background: white; border-radius: 6px; cursor: pointer; font-size: 13px; transition: all 0.2s; }
    .btn-sm:hover { background: #f5f5f5; }
    .btn-danger { color: #e74c3c; border-color: #e74c3c; }
    .btn-danger:hover { background: #fdecea; }
    .btn-primary { padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; transition: background 0.2s; }
    .btn-primary:hover { background: #5a6fd6; }
    .pagination { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: 20px; }
    .pagination button { padding: 8px 16px; border: 1px solid #ddd; background: white; border-radius: 6px; cursor: pointer; }
    .pagination button:disabled { opacity: 0.5; cursor: not-allowed; }
    .pagination span { font-size: 14px; color: #666; }
    .loading { text-align: center; color: #999; margin-top: 16px; }
  `],
})
export class MemberListComponent implements OnInit {
  private readonly memberService = inject(MemberService);
  private readonly router = inject(Router);

  readonly members = signal<Member[]>([]);
  readonly loading = signal(false);
  readonly page = signal(1);
  readonly totalPages = signal(1);
  searchTerm = '';

  ngOnInit(): void {
    this.loadMembers();
  }

  loadMembers(): void {
    this.loading.set(true);
    this.memberService.findAll(this.searchTerm || undefined, this.page()).subscribe({
      next: (res) => {
        this.members.set(res.data);
        this.totalPages.set(res.meta.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onSearch(): void {
    this.page.set(1);
    this.loadMembers();
  }

  goToPage(p: number): void {
    this.page.set(p);
    this.loadMembers();
  }

  create(): void {
    this.router.navigate(['/members/new']);
  }

  edit(member: Member): void {
    this.router.navigate(['/members', member.id]);
  }

  delete(member: Member): void {
    if (!confirm(`¿Eliminar a ${member.fullName}?`)) return;
    this.memberService.remove(member.id).subscribe(() => this.loadMembers());
  }
}
