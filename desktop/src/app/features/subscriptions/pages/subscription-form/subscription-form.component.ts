import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { SubscriptionService, CreateSubscriptionDto } from '../../services/subscription.service';
import { MemberService, Member } from '../../../members/services/member.service';
import { PlanService, Plan } from '../../../plans/services/plan.service';
import { BranchStore } from '../../../../core/services/branch-store.service';

@Component({
  selector: 'app-subscription-form',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatCardModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Nueva suscripción</h1>
        <button mat-stroked-button (click)="cancel()">Volver</button>
      </div>

      <mat-card class="!rounded-xl !shadow-sm">
        <mat-card-content>
          <form (ngSubmit)="onSubmit()" #form="ngForm">
            @if (loadingData()) {
              <div class="loading">Cargando datos...</div>
            }

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Miembro *</mat-label>
              <mat-select id="memberId" [(ngModel)]="dto.memberId" name="memberId" required [disabled]="loadingData()">
                <mat-option value="">Seleccionar miembro...</mat-option>
                @for (member of members(); track member.id) {
                  <mat-option [value]="member.id">{{ member.fullName }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Plan *</mat-label>
              <mat-select id="planId" [(ngModel)]="dto.planId" name="planId" required [disabled]="loadingData()" (selectionChange)="onPlanChange()">
                <mat-option value="">Seleccionar plan...</mat-option>
                @for (plan of plans(); track plan.id) {
                  <mat-option [value]="plan.id">{{ plan.name }} - {{ '$' + plan.price }} ({{ plan.duration }} días)</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Fecha de inicio</mat-label>
              <input matInput id="startDate" type="date" [(ngModel)]="dto.startDate" name="startDate" />
            </mat-form-field>

            <mat-card appearance="outlined" class="!rounded-xl !shadow-sm payment-card">
              <mat-card-content>
                <h3 class="payment-title">Datos de pago</h3>

                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Método de pago *</mat-label>
                  <mat-select id="paymentMethod" [(ngModel)]="dto.paymentMethod" name="paymentMethod" required>
                    <mat-option value="">Seleccionar método...</mat-option>
                    <mat-option value="cash">Efectivo</mat-option>
                    <mat-option value="card">Tarjeta</mat-option>
                    <mat-option value="transfer">Transferencia</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Monto ($) *</mat-label>
                  <input matInput id="paymentAmount" type="number" [(ngModel)]="dto.paymentAmount" name="paymentAmount" required min="0" step="0.01" />
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Referencia</mat-label>
                  <input matInput id="paymentReference" type="text" [(ngModel)]="dto.paymentReference" name="paymentReference" placeholder="Últimos 4 dígitos, ID de transferencia..." />
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Notas</mat-label>
                  <textarea matInput id="paymentNotes" [(ngModel)]="dto.paymentNotes" name="paymentNotes" rows="2" placeholder="Notas adicionales..."></textarea>
                </mat-form-field>
              </mat-card-content>
            </mat-card>

            @if (error) {
              <p class="error-msg">{{ error }}</p>
            }

            <div class="form-actions">
              <button mat-stroked-button type="button" (click)="cancel()">Cancelar</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="submitting">
                {{ submitting ? 'Guardando...' : 'Crear suscripción y registrar pago' }}
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
    .error-msg { color: var(--color-error-text); background: var(--color-error-bg); padding: 10px 14px; border-radius: var(--radius-md); font-size: 13px; margin-bottom: 16px; }
    .form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 16px; }
    .payment-card { margin-bottom: 16px; }
    .payment-card .payment-title { margin: 0 0 16px; font-size: 14px; font-weight: 600; color: var(--color-text-heading); }
    .loading { text-align: center; color: var(--color-text-muted); padding: 20px; }
  `],
})
export class SubscriptionFormComponent implements OnInit {
  private readonly subscriptionService = inject(SubscriptionService);
  private readonly memberService = inject(MemberService);
  private readonly planService = inject(PlanService);
  private readonly branchStore = inject(BranchStore);
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

    const cleaned: any = { ...this.dto, paymentBranchId: this.branchStore.selectedBranch()?.id };
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
