import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { SubscriptionService, Subscription } from '../../services/subscription.service';

@Component({
  selector: 'app-subscription-list',
  standalone: true,
  imports: [
    MatButtonModule, MatIconModule, MatPaginatorModule, MatCardModule,
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Suscripciones</h1>
        <button mat-raised-button color="primary" (click)="create()">
          <mat-icon>add</mat-icon>
          Nueva suscripción
        </button>
      </div>

      <mat-card class="!rounded-xl !shadow-sm">
        <mat-card-content class="!p-6">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-200">
                  <th class="text-left font-semibold text-gray-500 uppercase text-xs tracking-wider py-3 px-4">Miembro</th>
                  <th class="text-left font-semibold text-gray-500 uppercase text-xs tracking-wider py-3 px-4">Plan</th>
                  <th class="text-left font-semibold text-gray-500 uppercase text-xs tracking-wider py-3 px-4">Inicio</th>
                  <th class="text-left font-semibold text-gray-500 uppercase text-xs tracking-wider py-3 px-4">Fin</th>
                  <th class="text-left font-semibold text-gray-500 uppercase text-xs tracking-wider py-3 px-4">Estado</th>
                  <th class="text-left font-semibold text-gray-500 uppercase text-xs tracking-wider py-3 px-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (sub of subscriptions(); track sub.id) {
                  <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td class="py-3 px-4 font-medium text-gray-800">{{ sub.member?.fullName ?? sub.memberId }}</td>
                    <td class="py-3 px-4 text-gray-500">{{ sub.plan?.name ?? sub.planId }}</td>
                    <td class="py-3 px-4 text-gray-500">{{ sub.startDate }}</td>
                    <td class="py-3 px-4 text-gray-500">{{ sub.endDate }}</td>
                    <td class="py-3 px-4">
                      <span class="badge badge-{{ sub.status }}">
                        {{ statusLabel(sub.status) }}
                      </span>
                    </td>
                    <td class="py-3 px-4">
                      @if (sub.status === 'active') {
                        <button mat-stroked-button class="!mr-2" (click)="pause(sub)">
                          <mat-icon>pause</mat-icon>
                          Pausar
                        </button>
                        <button mat-stroked-button color="warn" (click)="cancel(sub)">Cancelar</button>
                      }
                      @if (sub.status === 'paused') {
                        <button mat-stroked-button class="!mr-2" (click)="resume(sub)">
                          <mat-icon>play_arrow</mat-icon>
                          Reanudar
                        </button>
                        <button mat-stroked-button color="warn" (click)="cancel(sub)">Cancelar</button>
                      }
                      @if (sub.status === 'cancelled' || sub.status === 'expired') {
                        <span class="text-gray-300">—</span>
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
export class SubscriptionListComponent implements OnInit {
  private readonly subscriptionService = inject(SubscriptionService);
  private readonly router = inject(Router);

  readonly subscriptions = signal<Subscription[]>([]);
  readonly loading = signal(false);
  readonly page = signal(1);
  readonly total = signal(0);
  readonly totalPages = signal(1);

  ngOnInit(): void { this.loadSubscriptions(); }

  loadSubscriptions(): void {
    this.loading.set(true);
    this.subscriptionService.findAll(undefined, this.page()).subscribe({
      next: (res) => {
        this.subscriptions.set(res.data);
        this.total.set(res.meta.total);
        this.totalPages.set(res.meta.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onPageChange(e: PageEvent): void {
    this.page.set(e.pageIndex + 1);
    this.loadSubscriptions();
  }

  create(): void { this.router.navigate(['/subscriptions/new']); }

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
