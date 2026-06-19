import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PlanService, Plan, CreatePlanDto } from '../../services/plan.service';

@Component({
  selector: 'app-plan-form',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>{{ isEdit ? 'Editar plan' : 'Nuevo plan' }}</h1>
        <button class="btn-secondary" (click)="cancel()">Volver</button>
      </div>

      <div class="card">
        <form (ngSubmit)="onSubmit()" #form="ngForm">
          <div class="form-row">
            <div class="form-group">
              <label for="name">Nombre del plan *</label>
              <input id="name" type="text" [(ngModel)]="dto.name" name="name" required placeholder="Ej: Mensual" />
            </div>
            <div class="form-group">
              <label for="duration">Duración (días) *</label>
              <input id="duration" type="number" [(ngModel)]="dto.duration" name="duration" required min="1" placeholder="30" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="price">Precio ($) *</label>
              <input id="price" type="number" [(ngModel)]="dto.price" name="price" required min="0" step="0.01" placeholder="29.99" />
            </div>
            <div class="form-group">
              <label for="classCount">Clases incluidas</label>
              <input id="classCount" type="number" [(ngModel)]="dto.classCount" name="classCount" min="1" placeholder="Dejar vacío = sin límite" />
            </div>
          </div>

          <div class="form-group">
            <label for="description">Descripción</label>
            <textarea id="description" [(ngModel)]="dto.description" name="description" rows="3" placeholder="Descripción del plan..."></textarea>
          </div>

          @if (error) {
            <p class="error-msg">{{ error }}</p>
          }

          <div class="form-actions">
            <button type="button" class="btn-secondary" (click)="cancel()">Cancelar</button>
            <button type="submit" class="btn-primary" [disabled]="submitting">
              {{ submitting ? 'Guardando...' : 'Guardar' }}
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
    .card { background: white; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); padding: 24px; max-width: 700px; }
    .form-row { display: flex; gap: 16px; margin-bottom: 16px; }
    .form-row .form-group { flex: 1; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; margin-bottom: 6px; font-size: 13px; font-weight: 600; color: #555; }
    .form-group input, .form-group textarea, .form-group select { width: 100%; padding: 10px 14px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; box-sizing: border-box; }
    .form-group input:focus, .form-group textarea:focus, .form-group select:focus { outline: none; border-color: #667eea; }
    .form-group textarea { resize: vertical; }
    .error-msg { color: #e74c3c; background: #fdecea; padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; }
    .form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; }
    .btn-primary { padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; transition: background 0.2s; }
    .btn-primary:hover { background: #5a6fd6; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-secondary { padding: 10px 20px; background: white; color: #666; border: 1px solid #ddd; border-radius: 8px; cursor: pointer; font-size: 14px; transition: all 0.2s; }
    .btn-secondary:hover { background: #f5f5f5; }
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
