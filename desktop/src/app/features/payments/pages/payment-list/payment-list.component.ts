import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PaymentService, Payment } from '../../services/payment.service';

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Pagos</h1>
        <button class="btn-primary" (click)="create()">+ Nuevo pago</button>
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Miembro</th>
              <th>Monto</th>
              <th>Método</th>
              <th>Referencia</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (payment of payments(); track payment.id) {
              <tr>
                <td>{{ payment.member?.fullName ?? payment.subscription?.member?.fullName ?? payment.memberId }}</td>
                <td>{{ '$' + payment.amount }}</td>
                <td>{{ methodLabel(payment.method) }}</td>
                <td>{{ payment.reference ?? '—' }}</td>
                <td>{{ payment.paidAt | date:'dd/MM/yyyy HH:mm' }}</td>
                <td class="actions">
                  <button class="btn-sm" (click)="viewReceipt(payment)">Ver recibo</button>
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
    .actions { display: flex; gap: 8px; }
    .btn-sm { padding: 6px 14px; border: 1px solid #ddd; background: white; border-radius: 6px; cursor: pointer; font-size: 13px; transition: all 0.2s; }
    .btn-sm:hover { background: #f5f5f5; }
    .btn-primary { padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; transition: background 0.2s; }
    .btn-primary:hover { background: #5a6fd6; }
    .pagination { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: 20px; }
    .pagination button { padding: 8px 16px; border: 1px solid #ddd; background: white; border-radius: 6px; cursor: pointer; }
    .pagination button:disabled { opacity: 0.5; cursor: not-allowed; }
    .pagination span { font-size: 14px; color: #666; }
    .loading { text-align: center; color: #999; margin-top: 16px; }
  `],
})
export class PaymentListComponent implements OnInit {
  private readonly paymentService = inject(PaymentService);
  private readonly router = inject(Router);

  readonly payments = signal<Payment[]>([]);
  readonly loading = signal(false);
  readonly page = signal(1);
  readonly totalPages = signal(1);

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.loading.set(true);
    this.paymentService.findAll(undefined, this.page()).subscribe({
      next: (res) => {
        this.payments.set(res.data);
        this.totalPages.set(res.meta.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  goToPage(p: number): void {
    this.page.set(p);
    this.loadPayments();
  }

  create(): void {
    this.router.navigate(['/payments/new']);
  }

  viewReceipt(payment: Payment): void {
    this.router.navigate(['/payments', payment.id]);
  }

  methodLabel(method: string): string {
    const labels: Record<string, string> = {
      cash: 'Efectivo',
      card: 'Tarjeta',
      transfer: 'Transferencia',
    };
    return labels[method] ?? method;
  }
}
