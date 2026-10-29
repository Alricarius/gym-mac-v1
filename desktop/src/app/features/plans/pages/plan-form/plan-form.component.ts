import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router';
import { PlanService, Plan, CreatePlanDto } from '../../services/plan.service';

@Component({
  selector: 'app-plan-form',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule],
  template: `
    <div class="page">
      <mat-card class="!rounded-xl !shadow-sm">
        <mat-card-header>
          <mat-card-title>{{ isEdit ? 'Editar plan' : 'Nuevo plan' }}</mat-card-title>
        </mat-card-header>

        <mat-card-content>
        <form (ngSubmit)="onSubmit()" #form="ngForm">
          <div class="form-row">
            <mat-form-field appearance="outline" class="flex-1">
              <mat-label>Nombre del plan *</mat-label>
              <input matInput id="name" type="text" [(ngModel)]="dto.name" name="name" required placeholder="Ej: Mensual" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="flex-1">
              <mat-label>Duración (días) *</mat-label>
              <input matInput id="duration" type="number" [(ngModel)]="dto.duration" name="duration" required min="1" placeholder="30" />
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="flex-1">
              <mat-label>Precio ($) *</mat-label>
              <input matInput id="price" type="number" [(ngModel)]="dto.price" name="price" required min="0" step="0.01" placeholder="29.99" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="flex-1">
              <mat-label>Clases incluidas</mat-label>
              <input matInput id="classCount" type="number" [(ngModel)]="dto.classCount" name="classCount" min="1" placeholder="Dejar vacío = sin límite" />
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Descripción</mat-label>
            <textarea matInput id="description" [(ngModel)]="dto.description" name="description" rows="3" placeholder="Descripción del plan..."></textarea>
          </mat-form-field>

          @if (error) {
            <p class="error-msg">{{ error }}</p>
          }

          <div class="form-actions">
            <button type="button" mat-stroked-button (click)="cancel()">Cancelar</button>
            <button type="submit" mat-raised-button color="primary" [disabled]="submitting">
              {{ submitting ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page { padding: 24px; }
    .form-row { display: flex; gap: 16px; }
    .form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 16px; }
    .error-msg { color: var(--color-error-text); background: var(--color-error-bg); padding: 10px 14px; border-radius: var(--radius-md); font-size: 13px; margin-bottom: 16px; }
  `],
})
export class PlanFormComponent implements OnInit {
  private readonly planService = inject(PlanService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  isEdit = false;
  planId = '';
  dto: CreatePlanDto = {
    name: '',
    duration: 30,
    price: 0,
    classCount: undefined,
    description: '',
  };
  submitting = false;
  error = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.planId = id;
      this.planService.findById(id).subscribe({
        next: (plan) => {
          this.dto = {
            name: plan.name,
            duration: plan.duration,
            price: Number(plan.price),
            classCount: plan.classCount,
            description: plan.description || '',
          };
        },
        error: () => this.router.navigate(['/plans']),
      });
    }
  }

  onSubmit(): void {
    if (!this.dto.name.trim()) return;
    this.submitting = true;
    this.error = '';

    const cleaned = { ...this.dto };
    (Object.keys(cleaned) as (keyof CreatePlanDto)[]).forEach((k) => {
      if (cleaned[k] === undefined || cleaned[k] === null) delete cleaned[k];
    });
    cleaned.name = this.dto.name.trim();

    const req = this.isEdit
      ? this.planService.update(this.planId, cleaned)
      : this.planService.create(cleaned);

    req.subscribe({
      next: () => this.router.navigate(['/plans']),
      error: () => {
        this.error = 'Error al guardar. Verifique los datos.';
        this.submitting = false;
      },
      complete: () => (this.submitting = false),
    });
  }

  cancel(): void {
    this.router.navigate(['/plans']);
  }
}
