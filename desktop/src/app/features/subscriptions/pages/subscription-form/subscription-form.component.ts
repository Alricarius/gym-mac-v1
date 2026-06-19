import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SubscriptionService, CreateSubscriptionDto } from '../../services/subscription.service';
import { MemberService, Member } from '../../../members/services/member.service';
import { PlanService, Plan } from '../../../plans/services/plan.service';

@Component({
  selector: 'app-subscription-form',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Nueva suscripción</h1>
        <button class="btn-secondary" (click)="cancel()">Volver</button>
      </div>

      <div class="card">
        <form (ngSubmit)="onSubmit()" #form="ngForm">
          @if (loadingData()) {
            <div class="loading">Cargando datos...</div>
          }

          <div class="form-group">
            <label for="memberId">Miembro *</label>
            <select id="memberId" [(ngModel)]="dto.memberId" name="memberId" required [disabled]="loadingData()">
              <option value="">Seleccionar miembro...</option>
              @for (member of members(); track member.id) {
                <option [value]="member.id">{{ member.fullName }}</option>
              }
            </select>
          </div>

          <div class="form-group">
            <label for="planId">Plan *</label>
            <select id="planId" [(ngModel)]="dto.planId" name="planId" required [disabled]="loadingData()" (change)="onPlanChange()">
              <option value="">Seleccionar plan...</option>
              @for (plan of plans(); track plan.id) {
                <option [value]="plan.id">{{ plan.name }} - {{ '$' + plan.price }} ({{ plan.duration }} días)</option>
              }
            </select>
          </div>

          <div class="form-group">
            <label for="startDate">Fecha de inicio</label>
            <input id="startDate" type="date" [(ngModel)]="dto.startDate" name="startDate" />
          </div>

          <fieldset class="payment-section">
            <legend>Datos de pago</legend>

            <div class="form-group">
              <label for="paymentMethod">Método de pago *</label>
              <select id="paymentMethod" [(ngModel)]="dto.paymentMethod" name="paymentMethod" required>
                <option value="">Seleccionar método...</option>
                <option value="cash">Efectivo</option>
                <option value="card">Tarjeta</option>
                <option value="transfer">Transferencia</option>
              </select>
            </div>

            <div class="form-group">
              <label for="paymentAmount">Monto ($) *</label>
              <input id="paymentAmount" type="number" [(ngModel)]="dto.paymentAmount" name="paymentAmount" required min="0" step="0.01" />
            </div>

            <div class="form-group">
              <label for="paymentReference">Referencia</label>
              <input id="paymentReference" type="text" [(ngModel)]="dto.paymentReference" name="paymentReference" placeholder="Últimos 4 dígitos, ID de transferencia..." />
            </div>

            <div class="form-group">
              <label for="paymentNotes">Notas</label>
              <textarea id="paymentNotes" [(ngModel)]="dto.paymentNotes" name="paymentNotes" rows="2" placeholder="Notas adicionales..."></textarea>
            </div>
          </fieldset>

          @if (error) {
            <p class="error-msg">{{ error }}</p>
          }

          <div class="form-actions">
            <button type="button" class="btn-secondary" (click)="cancel()">Cancelar</button>
            <button type="submit" class="btn-primary" [disabled]="submitting">
              {{ submitting ? 'Guardando...' : 'Crear suscripción y registrar pago' }}
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
    .payment-section { border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
    .payment-section legend { font-size: 14px; font-weight: 600; color: #333; padding: 0 8px; }
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
export class SubscriptionFormComponent implements OnInit {
  private readonly subscriptionService = inject(SubscriptionService);
  private readonly memberService = inject(MemberService);
  private readonly planService = inject(PlanService);
  private readonly router = inject(Router);

  readonly members = signal<Member[]>([]);
  readonly plans = signal<Plan[]>([]);
  readonly loadingData = signal(true);
  dto: CreateSubscriptionDto = {
    memberId: '',
    planId: '',
    startDate: new Date().toISOString().split('T')[0],
    paymentMethod: '' as any,
    paymentAmount: undefined,
    paymentReference: '',
    paymentNotes: '',
  };
  submitting = false;
  error = '';

  ngOnInit(): void {
    this.memberService.findAll(undefined, 1, 100).subscribe({
      next: (res) => this.members.set(res.data),
      error: () => {
        this.error = 'Error al cargar miembros';
        this.loadingData.set(false);
      },
    });
    this.planService.findAll(undefined, 1, 100).subscribe({
      next: (res) => {
        this.plans.set(res.data.filter((p) => p.isActive));
        this.loadingData.set(false);
      },
      error: () => {
        this.error = 'Error al cargar planes';
        this.loadingData.set(false);
      },
    });
  }

  onPlanChange(): void {
    const plan = this.plans().find((p) => p.id === this.dto.planId);
    if (plan) {
      this.dto.paymentAmount = Number(plan.price);
    }
  }

  onSubmit(): void {
    if (!this.dto.memberId || !this.dto.planId || !this.dto.paymentMethod) return;
    this.submitting = true;
    this.error = '';

    const cleaned: any = { ...this.dto };
    if (!cleaned.startDate) delete cleaned.startDate;
    if (!cleaned.paymentReference) delete cleaned.paymentReference;
    if (!cleaned.paymentNotes) delete cleaned.paymentNotes;

    this.subscriptionService.create(cleaned).subscribe({
      next: () => this.router.navigate(['/subscriptions']),
      error: (err) => {
        this.error = err.error?.message ?? 'Error al crear la suscripción';
        this.submitting = false;
      },
      complete: () => (this.submitting = false),
    });
  }

  cancel(): void {
    this.router.navigate(['/subscriptions']);
  }
}
