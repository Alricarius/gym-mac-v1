import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SubscriptionService, Subscription } from '../../services/subscription.service';

@Component({
  selector: 'app-subscription-list',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Suscripciones</h1>
        <button class="btn-primary" (click)="create()">+ Nueva suscripción</button>
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Miembro</th>
              <th>Plan</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (sub of subscriptions(); track sub.id) {
              <tr>
                <td>{{ sub.member?.fullName ?? sub.memberId }}</td>
                <td>{{ sub.plan?.name ?? sub.planId }}</td>
                <td>{{ sub.startDate }}</td>
                <td>{{ sub.endDate }}</td>
                <td>
                  <span [class]="'badge badge-' + sub.status">
                    {{ statusLabel(sub.status) }}
                  </span>
                </td>
                <td class="actions">
                  @if (sub.status === 'active') {
                    <button class="btn-sm btn-warning" (click)="pause(sub)">Pausar</button>
                    <button class="btn-sm btn-danger" (click)="cancel(sub)">Cancelar</button>
                  }
                  @if (sub.status === 'paused') {
                    <button class="btn-sm" (click)="resume(sub)">Reanudar</button>
                    <button class="btn-sm btn-danger" (click)="cancel(sub)">Cancelar</button>
                  }
                  @if (sub.status === 'cancelled' || sub.status === 'expired') {
                    <span class="no-actions">—</span>
                  }
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6" class="empty">No hay suscripciones registradas</td>
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
    .table-container { background: white; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); overflow: hidden; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 12px 16px; text-align: left; font-size: 14px; }
    th { background: #f8f9fc; color: #666; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    td { border-top: 1px solid #f0f0f0; }
    .empty { text-align: center; color: #999; padding: 40px !important; }
    .badge { padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; }
    .badge-active { background: #e8f5e9; color: #2e7d32; }
    .badge-paused { background: #fff3e0; color: #e65100; }
    .badge-cancelled { background: #fbe9e7; color: #c62828; }
    .badge-expired { background: #f3e5f5; color: #6a1b9a; }
    .actions { display: flex; gap: 8px; }
    .no-actions { color: #ccc; }
    .btn-sm { padding: 6px 14px; border: 1px solid #ddd; background: white; border-radius: 6px; cursor: pointer; font-size: 13px; transition: all 0.2s; }
    .btn-sm:hover { background: #f5f5f5; }
    .btn-danger { color: #e74c3c; border-color: #e74c3c; }
    .btn-danger:hover { background: #fdecea; }
    .btn-warning { color: #e65100; border-color: #e65100; }
    .btn-warning:hover { background: #fff3e0; }
    .btn-primary { padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; transition: background 0.2s; }
    .btn-primary:hover { background: #5a6fd6; }
    .pagination { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: 20px; }
    .pagination button { padding: 8px 16px; border: 1px solid #ddd; background: white; border-radius: 6px; cursor: pointer; }
    .pagination button:disabled { opacity: 0.5; cursor: not-allowed; }
    .pagination span { font-size: 14px; color: #666; }
    .loading { text-align: center; color: #999; margin-top: 16px; }
  `],
})
export class SubscriptionListComponent implements OnInit {
  private readonly subscriptionService = inject(SubscriptionService);
  private readonly router = inject(Router);

  readonly subscriptions = signal<Subscription[]>([]);
  readonly loading = signal(false);
  readonly page = signal(1);
  readonly totalPages = signal(1);

  ngOnInit(): void {
    this.loadSubscriptions();
  }

  loadSubscriptions(): void {
    this.loading.set(true);
    this.subscriptionService.findAll(undefined, this.page()).subscribe({
      next: (res) => {
        this.subscriptions.set(res.data);
        this.totalPages.set(res.meta.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  goToPage(p: number): void {
    this.page.set(p);
    this.loadSubscriptions();
  }

  create(): void {
    this.router.navigate(['/subscriptions/new']);
  }

  pause(sub: Subscription): void {
    if (!confirm(`¿Pausar la suscripción de ${sub.member?.fullName ?? 'este miembro'}?`)) return;
    this.subscriptionService.pause(sub.id).subscribe(() => this.loadSubscriptions());
  }

  resume(sub: Subscription): void {
    if (!confirm(`¿Reanudar la suscripción de ${sub.member?.fullName ?? 'este miembro'}?`)) return;
    this.subscriptionService.resume(sub.id).subscribe(() => this.loadSubscriptions());
  }

  cancel(sub: Subscription): void {
    if (!confirm(`¿Cancelar la suscripción de ${sub.member?.fullName ?? 'este miembro'}?`)) return;
    this.subscriptionService.cancel(sub.id).subscribe(() => this.loadSubscriptions());
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      active: 'Activa',
      paused: 'Pausada',
      cancelled: 'Cancelada',
      expired: 'Vencida',
    };
    return labels[status] ?? status;
  }
}
