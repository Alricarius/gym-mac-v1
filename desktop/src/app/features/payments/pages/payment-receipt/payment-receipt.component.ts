import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PaymentService, Receipt } from '../../services/payment.service';

@Component({
  selector: 'app-payment-receipt',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page">
      <div class="page-header no-print">
        <h1>Recibo de pago</h1>
        <div class="header-actions">
          <button class="btn-secondary" (click)="goBack()">Volver</button>
          <button class="btn-primary" (click)="print()">Imprimir</button>
        </div>
      </div>

      @if (loading()) {
        <div class="loading">Cargando recibo...</div>
      }

      @if (error) {
        <p class="error-msg">{{ error }}</p>
      }

      @if (receipt(); as r) {
        <div class="receipt" id="receipt">
          <div class="receipt-header">
            <h2>GymAdmin</h2>
            <p class="receipt-subtitle">Comprobante de pago</p>
          </div>

          <div class="receipt-body">
            <div class="receipt-row">
              <span class="label">N° de recibo:</span>
              <span class="value">{{ r.receiptNumber }}</span>
            </div>
            <div class="receipt-row">
              <span class="label">Miembro:</span>
              <span class="value">{{ r.member }}</span>
            </div>
            <div class="receipt-row">
              <span class="label">Plan:</span>
              <span class="value">{{ r.plan }}</span>
            </div>
            <div class="receipt-row">
              <span class="label">Período:</span>
              <span class="value">{{ r.subscriptionStart }} — {{ r.subscriptionEnd }}</span>
            </div>
            <div class="receipt-divider"></div>
            <div class="receipt-row total">
              <span class="label">Monto:</span>
              <span class="value">{{ '$' + r.amount }}</span>
            </div>
            <div class="receipt-row">
              <span class="label">Método de pago:</span>
              <span class="value">{{ methodLabel(r.method) }}</span>
            </div>
            @if (r.reference) {
              <div class="receipt-row">
                <span class="label">Referencia:</span>
                <span class="value">{{ r.reference }}</span>
              </div>
            }
            <div class="receipt-row">
              <span class="label">Fecha de pago:</span>
              <span class="value">{{ r.paidAt | date:'dd/MM/yyyy HH:mm' }}</span>
            </div>
          </div>

          <div class="receipt-footer">
            <p>¡Gracias por tu pago!</p>
          </div>
        </div>
      }

      <div class="no-print" style="margin-top: 24px; text-align: center;">
        <button class="btn-primary" (click)="print()">Imprimir recibo</button>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h1 { margin: 0; font-size: 22px; color: var(--color-text-primary); }
    .header-actions { display: flex; gap: 12px; }
    .loading { text-align: center; color: var(--color-text-muted); padding: 40px; }
    .error-msg { color: var(--color-error-text); background: var(--color-error-bg); padding: 10px 14px; border-radius: var(--radius-md); font-size: 13px; margin-bottom: 16px; }
    .btn-primary { padding: 10px 20px; background: var(--color-primary); color: white; border: none; border-radius: var(--radius-md); cursor: pointer; font-size: 14px; font-weight: 600; transition: background 0.2s; }
    .btn-primary:hover { background: var(--color-primary-hover); }
    .btn-secondary { padding: 10px 20px; background: white; color: var(--color-text-secondary); border: 1px solid var(--color-border); border-radius: var(--radius-md); cursor: pointer; font-size: 14px; transition: all 0.2s; }
    .btn-secondary:hover { background: var(--color-surface-hover); }

    .receipt {
      max-width: 500px;
      margin: 0 auto;
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      padding: 32px;
    }

    .receipt-header {
      text-align: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 2px solid var(--color-border);
    }

    .receipt-header h2 {
      margin: 0;
      font-size: 24px;
      color: var(--color-text-primary);
    }

    .receipt-subtitle {
      margin: 4px 0 0;
      color: var(--color-text-secondary);
      font-size: 14px;
    }

    .receipt-body {
      margin-bottom: 24px;
    }

    .receipt-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 14px;
    }

    .receipt-row .label {
      color: var(--color-text-secondary);
      font-weight: 500;
    }

    .receipt-row .value {
      color: var(--color-text-primary);
      text-align: right;
    }

    .receipt-row.total .value {
      font-size: 18px;
      font-weight: 700;
      color: var(--color-success-text);
    }

    .receipt-row.total .label {
      font-size: 16px;
      font-weight: 600;
    }

    .receipt-divider {
      border-top: 1px dashed var(--color-border);
      margin: 8px 0;
    }

    .receipt-footer {
      text-align: center;
      padding-top: 16px;
      border-top: 2px solid var(--color-border);
      color: var(--color-text-secondary);
      font-size: 13px;
    }

    .receipt-footer p {
      margin: 0;
    }

    @media print {
      .no-print { display: none !important; }
      .page { padding: 0; }
      .receipt { box-shadow: none; border: none; padding: 16px; }
    }
  `],
})
export class PaymentReceiptComponent implements OnInit {
  private readonly paymentService = inject(PaymentService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly receipt = signal<Receipt | null>(null);
  readonly loading = signal(true);
  error = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'ID de pago no válido';
      this.loading.set(false);
      return;
    }
    this.paymentService.getReceipt(id).subscribe({
      next: (r) => {
        this.receipt.set(r);
        this.loading.set(false);
      },
      error: () => {
        this.error = 'Error al cargar el recibo';
        this.loading.set(false);
      },
    });
  }

  print(): void {
    window.print();
  }

  goBack(): void {
    this.router.navigate(['/payments']);
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
