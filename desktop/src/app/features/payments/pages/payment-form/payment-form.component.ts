import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PaymentService, CreatePaymentDto } from '../../services/payment.service';
import { SubscriptionService, Subscription } from '../../../subscriptions/services/subscription.service';

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Nuevo pago</h1>
        <button class="btn-secondary" (click)="cancel()">Volver</button>
      </div>

      <div class="card">
        <form (ngSubmit)="onSubmit()" #form="ngForm">
          @if (loadingData()) {
            <div class="loading">Cargando datos...</div>
          }

          <div class="form-group">
            <label for="subscriptionId">Suscripción *</label>
            <select id="subscriptionId" [(ngModel)]="dto.subscriptionId" name="subscriptionId" required (change)="onSubscriptionChange()" [disabled]="loadingData()">
              <option value="">Seleccionar suscripción...</option>
              @for (sub of subscriptions(); track sub.id) {
                <option [value]="sub.id">{{ sub.member?.fullName ?? sub.memberId }} — {{ sub.plan?.name ?? sub.planId }}</option>
              }
            </select>
          </div>

          <div class="form-group">
            <label for="amount">Monto ($) *</label>
            <input id="amount" type="number" [(ngModel)]="dto.amount" name="amount" required min="0" step="0.01" />
          </div>

          <div class="form-group">
            <label for="method">Método de pago *</label>
            <select id="method" [(ngModel)]="dto.method" name="method" required>
              <option value="">Seleccionar método...</option>
              <option value="cash">Efectivo</option>
              <option value="card">Tarjeta</option>
              <option value="transfer">Transferencia</option>
            </select>
          </div>

          <div class="form-group">
            <label for="reference">Referencia</label>
            <input id="reference" type="text" [(ngModel)]="dto.reference" name="reference" placeholder="Últimos 4 dígitos, ID de transferencia..." />
          </div>

          <div class="form-group">
            <label for="notes">Notas</label>
            <textarea id="notes" [(ngModel)]="dto.notes" name="notes" rows="2" placeholder="Notas adicionales..."></textarea>
          </div>

          <div class="form-group">
            <label for="paidAt">Fecha de pago</label>
            <input id="paidAt" type="datetime-local" [(ngModel)]="paidAtStr" name="paidAt" />
          </div>

          @if (error) {
            <p class="error-msg">{{ error }}</p>
          }

          <div class="form-actions">
            <button type="button" class="btn-secondary" (click)="cancel()">Cancelar</button>
            <button type="submit" class="btn-primary" [disabled]="submitting">
              {{ submitting ? 'Guardando...' : 'Registrar pago' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h1 { margin: 0; font-size: 22px; color: #1a1a2e; }
    .card { background: white; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); padding: 24px; max-width: 500px; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; margin-bottom: 6px; font-size: 13px; font-weight: 600; color: #555; }
    .form-group select, .form-group input, .form-group textarea { width: 100%; padding: 10px 14px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; box-sizing: border-box; }
    .form-group select:focus, .form-group input:focus, .form-group textarea:focus { outline: none; border-color: #667eea; }
    .form-group textarea { resize: vertical; }
    .error-msg { color: #e74c3c; background: #fdecea; padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; }
    .form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; }
    .btn-primary { padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; transition: background 0.2s; }
    .btn-primary:hover { background: #5a6fd6; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-secondary { padding: 10px 20px; background: white; color: #666; border: 1px solid #ddd; border-radius: 8px; cursor: pointer; font-size: 14px; transition: all 0.2s; }
    .btn-secondary:hover { background: #f5f5f5; }
    .loading { text-align: center; color: #999; padding: 20px; }
  `],
})
export class PaymentFormComponent implements OnInit {
  private readonly paymentService = inject(PaymentService);
  private readonly subscriptionService = inject(SubscriptionService);
  private readonly router = inject(Router);

  readonly subscriptions = signal<Subscription[]>([]);
  readonly loadingData = signal(true);

  dto: CreatePaymentDto = {
    subscriptionId: '',
    amount: undefined,
    method: '' as any,
    reference: '',
    notes: '',
    paidAt: undefined,
  };
  paidAtStr = '';
  submitting = false;
  error = '';

  ngOnInit(): void {
    const now = new Date();
    this.paidAtStr =
      now.getFullYear() + '-' +
      String(now.getMonth() + 1).padStart(2, '0') + '-' +
      String(now.getDate()).padStart(2, '0') + 'T' +
      String(now.getHours()).padStart(2, '0') + ':' +
      String(now.getMinutes()).padStart(2, '0');

    this.subscriptionService.findAll(undefined, 1, 100).subscribe({
      next: (res) => {
        this.subscriptions.set(res.data);
        this.loadingData.set(false);
      },
      error: () => {
        this.error = 'Error al cargar suscripciones';
        this.loadingData.set(false);
      },
    });
  }

  onSubscriptionChange(): void {
    const sub = this.subscriptions().find((s) => s.id === this.dto.subscriptionId);
    if (sub?.plan?.price && !this.dto.amount) {
      this.dto.amount = Number(sub.plan.price);
    }
  }

  onSubmit(): void {
    if (!this.dto.subscriptionId || !this.dto.method || this.dto.amount === undefined || this.dto.amount === null) return;
    this.submitting = true;
    this.error = '';

    const cleaned: any = { ...this.dto };
    if (this.paidAtStr) {
      cleaned.paidAt = new Date(this.paidAtStr).toISOString();
    } else {
      delete cleaned.paidAt;
    }
    if (!cleaned.reference) delete cleaned.reference;
    if (!cleaned.notes) delete cleaned.notes;

    this.paymentService.create(cleaned).subscribe({
      next: () => this.router.navigate(['/payments']),
      error: (err) => {
        this.error = err.error?.message ?? 'Error al registrar el pago';
        this.submitting = false;
      },
      complete: () => (this.submitting = false),
    });
  }

  cancel(): void {
    this.router.navigate(['/payments']);
  }
}
