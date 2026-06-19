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
    .page-header h1 { margin: 0; font-size: 22px; color: #1a1a2e; }
    .header-actions { display: flex; gap: 12px; }
    .loading { text-align: center; color: #999; padding: 40px; }
    .error-msg { color: #e74c3c; background: #fdecea; padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; }
    .btn-primary { padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; transition: background 0.2s; }
    .btn-primary:hover { background: #5a6fd6; }
    .btn-secondary { padding: 10px 20px; background: white; color: #666; border: 1px solid #ddd; border-radius: 8px; cursor: pointer; font-size: 14px; transition: all 0.2s; }
    .btn-secondary:hover { background: #f5f5f5; }

    .receipt {
      max-width: 500px;
      margin: 0 auto;
      background: white;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      padding: 32px;
    }

    .receipt-header {
      text-align: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 2px solid #f0f0f0;
    }

    .receipt-header h2 {
      margin: 0;
      font-size: 24px;
      color: #1a1a2e;
    }

    .receipt-subtitle {
      margin: 4px 0 0;
      color: #999;
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
      color: #666;
      font-weight: 500;
    }

    .receipt-row .value {
      color: #1a1a2e;
      text-align: right;
    }

    .receipt-row.total .value {
      font-size: 18px;
      font-weight: 700;
      color: #2e7d32;
    }

    .receipt-row.total .label {
      font-size: 16px;
      font-weight: 600;
    }

    .receipt-divider {
      border-top: 1px dashed #ddd;
      margin: 8px 0;
    }

    .receipt-footer {
      text-align: center;
      padding-top: 16px;
      border-top: 2px solid #f0f0f0;
      color: #999;
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
