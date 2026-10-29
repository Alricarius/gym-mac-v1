import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { PaymentService, CreatePaymentDto } from '../../services/payment.service';
import { SubscriptionService, Subscription } from '../../../subscriptions/services/subscription.service';
import { BranchStore } from '../../../../core/services/branch-store.service';

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatCardModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Nuevo pago</h1>
        <button mat-button (click)="cancel()">Volver</button>
      </div>

      <mat-card>
        <mat-card-content>
          <form (ngSubmit)="onSubmit()" #form="ngForm">
            @if (loadingData()) {
              <div class="loading">Cargando datos...</div>
            }

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Suscripción *</mat-label>
              <mat-select
                id="subscriptionId"
                [(ngModel)]="dto.subscriptionId"
                name="subscriptionId"
                required
                (selectionChange)="onSubscriptionChange()"
                [disabled]="loadingData()">
                <mat-option value="">Seleccionar suscripción...</mat-option>
                @for (sub of subscriptions(); track sub.id) {
                  <mat-option [value]="sub.id">{{ sub.member?.fullName ?? sub.memberId }} — {{ sub.plan?.name ?? sub.planId }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Monto ($) *</mat-label>
              <input matInput id="amount" type="number" [(ngModel)]="dto.amount" name="amount" required min="0" step="0.01" />
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Método de pago *</mat-label>
              <mat-select id="method" [(ngModel)]="dto.method" name="method" required>
                <mat-option value="">Seleccionar método...</mat-option>
                <mat-option value="cash">Efectivo</mat-option>
                <mat-option value="card">Tarjeta</mat-option>
                <mat-option value="transfer">Transferencia</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Referencia</mat-label>
              <input matInput id="reference" type="text" [(ngModel)]="dto.reference" name="reference" placeholder="Últimos 4 dígitos, ID de transferencia..." />
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Notas</mat-label>
              <textarea matInput id="notes" [(ngModel)]="dto.notes" name="notes" rows="2" placeholder="Notas adicionales..."></textarea>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Fecha de pago</mat-label>
              <input matInput id="paidAt" type="datetime-local" [(ngModel)]="paidAtStr" name="paidAt" />
            </mat-form-field>

            @if (error) {
              <p class="error-msg">{{ error }}</p>
            }

            <div class="form-actions">
              <button mat-stroked-button type="button" (click)="cancel()">Cancelar</button>
              <button mat-flat-button color="primary" type="submit" [disabled]="submitting">
                {{ submitting ? 'Guardando...' : 'Registrar pago' }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page { padding: 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h1 { margin: 0; font-size: 22px; color: var(--color-text-primary); }
    .full-width { width: 100%; margin-bottom: 16px; }
    .error-msg { color: var(--color-error-text); background: var(--color-error-bg); padding: 10px 14px; border-radius: var(--radius-md); font-size: 13px; margin-bottom: 16px; }
    .form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 16px; }
    .loading { text-align: center; color: var(--color-text-muted); padding: 20px; }
  `],
})
export class PaymentFormComponent implements OnInit {
  private readonly paymentService = inject(PaymentService);
  private readonly subscriptionService = inject(SubscriptionService);
  private readonly branchStore = inject(BranchStore);
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

    const cleaned: any = { ...this.dto, branchId: this.branchStore.selectedBranch()?.id };
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
