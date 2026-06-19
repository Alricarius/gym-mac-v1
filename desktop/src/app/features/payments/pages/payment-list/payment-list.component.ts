import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { PaymentService, Payment } from '../../services/payment.service';

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [
    CommonModule, MatButtonModule, MatIconModule, MatPaginatorModule, MatCardModule,
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Pagos</h1>
        <button mat-raised-button color="primary" (click)="create()">
          <mat-icon>add</mat-icon>
          Nuevo pago
        </button>
      </div>

      <mat-card class="!rounded-xl !shadow-sm">
        <mat-card-content class="!p-6">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-200">
                  <th class="text-left font-semibold text-gray-500 uppercase text-xs tracking-wider py-3 px-4">Miembro</th>
                  <th class="text-left font-semibold text-gray-500 uppercase text-xs tracking-wider py-3 px-4">Monto</th>
                  <th class="text-left font-semibold text-gray-500 uppercase text-xs tracking-wider py-3 px-4">Método</th>
                  <th class="text-left font-semibold text-gray-500 uppercase text-xs tracking-wider py-3 px-4">Referencia</th>
                  <th class="text-left font-semibold text-gray-500 uppercase text-xs tracking-wider py-3 px-4">Fecha</th>
                  <th class="text-left font-semibold text-gray-500 uppercase text-xs tracking-wider py-3 px-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (payment of payments(); track payment.id) {
                  <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td class="py-3 px-4 font-medium text-gray-800">{{ payment.member?.fullName ?? payment.subscription?.member?.fullName ?? payment.memberId }}</td>
                    <td class="py-3 px-4 text-gray-500">{{ '$' + payment.amount }}</td>
                    <td class="py-3 px-4 text-gray-500">{{ methodLabel(payment.method) }}</td>
                    <td class="py-3 px-4 text-gray-500">{{ payment.reference ?? '—' }}</td>
                    <td class="py-3 px-4 text-gray-500">{{ payment.paidAt | date:'dd/MM/yyyy HH:mm' }}</td>
                    <td class="py-3 px-4">
                      <button mat-stroked-button (click)="viewReceipt(payment)">Ver recibo</button>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6" class="empty">No hay pagos registrados</td>
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
export class PaymentListComponent implements OnInit {
  private readonly paymentService = inject(PaymentService);
  private readonly router = inject(Router);

  readonly payments = signal<Payment[]>([]);
  readonly loading = signal(false);
  readonly page = signal(1);
  readonly total = signal(0);
  readonly totalPages = signal(1);

  ngOnInit(): void { this.loadPayments(); }

  loadPayments(): void {
    this.loading.set(true);
    this.paymentService.findAll(undefined, this.page()).subscribe({
      next: (res) => {
        this.payments.set(res.data);
        this.total.set(res.meta.total);
        this.totalPages.set(res.meta.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onPageChange(e: PageEvent): void {
    this.page.set(e.pageIndex + 1);
    this.loadPayments();
  }

  create(): void { this.router.navigate(['/payments/new']); }
  viewReceipt(payment: Payment): void { this.router.navigate(['/payments', payment.id]); }

  methodLabel(method: string): string {
    const labels: Record<string, string> = {
      cash: 'Efectivo',
      card: 'Tarjeta',
      transfer: 'Transferencia',
    };
    return labels[method] ?? method;
  }
}
