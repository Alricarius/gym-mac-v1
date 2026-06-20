import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BranchService, CreateBranchDto } from '../../services/branch.service';

@Component({
  selector: 'app-branch-form',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>{{ isEdit ? 'Editar sucursal' : 'Nueva sucursal' }}</h1>
        <button class="btn-secondary" (click)="cancel()">Volver</button>
      </div>

      <div class="card">
        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="name">Nombre *</label>
            <input id="name" type="text" [(ngModel)]="dto.name" name="name" required placeholder="Nombre de la sucursal" />
          </div>

          <div class="form-group">
            <label for="address">Dirección</label>
            <input id="address" type="text" [(ngModel)]="dto.address" name="address" placeholder="Dirección" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="phone">Teléfono</label>
              <input id="phone" type="text" [(ngModel)]="dto.phone" name="phone" placeholder="555-0000" />
            </div>
            <div class="form-group">
              <label for="email">Email</label>
              <input id="email" type="email" [(ngModel)]="dto.email" name="email" placeholder="correo@ejemplo.com" />
            </div>
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
    .page { padding: 24px; max-width: 600px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h1 { margin: 0; font-size: 22px; color: #1a1a2e; }
    .card { background: white; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); padding: 24px; }
    .form-row { display: flex; gap: 16px; }
    .form-row .form-group { flex: 1; }
    .form-group { margin-bottom: 20px; }
    label { display: block; margin-bottom: 6px; font-size: 13px; font-weight: 600; color: #333; }
    input, select, textarea { width: 100%; padding: 10px 14px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; box-sizing: border-box; transition: border-color 0.2s; font-family: inherit; }
    input:focus, select:focus, textarea:focus { outline: none; border-color: #667eea; }
    textarea { resize: vertical; }
    .error-msg { color: #e74c3c; font-size: 13px; margin-bottom: 16px; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px; }
    .btn-primary { padding: 10px 24px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; transition: background 0.2s; }
    .btn-primary:hover:not(:disabled) { background: #5a6fd6; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-secondary { padding: 10px 24px; border: 1px solid #ddd; background: white; border-radius: 8px; cursor: pointer; font-size: 14px; transition: all 0.2s; }
    .btn-secondary:hover { background: #f5f5f5; }
  `],
})
export class BranchFormComponent implements OnInit {
  private readonly branchService = inject(BranchService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  isEdit = false;
  branchId = '';
  dto: CreateBranchDto = { name: '', address: '', phone: '', email: '' };
  submitting = false;
  error = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.branchId = id;
      this.branchService.findById(id).subscribe({
        next: (branch) => {
          this.dto = {
            name: branch.name,
            address: branch.address || '',
            phone: branch.phone || '',
            email: branch.email || '',
          };
        },
        error: () => this.router.navigate(['/branches']),
      });
    }
  }

  onSubmit(): void {
    if (!this.dto.name.trim()) return;
    this.submitting = true;
    this.error = '';

    const cleaned = { ...this.dto };
    Object.keys(cleaned).forEach((k) => {
      if (!(cleaned as any)[k]) delete (cleaned as any)[k];
    });
    cleaned.name = this.dto.name.trim();

    const req = this.isEdit
      ? this.branchService.update(this.branchId, cleaned)
      : this.branchService.create(cleaned);

    req.subscribe({
      next: () => this.router.navigate(['/branches']),
      error: () => {
        this.error = 'Error al guardar. Verifique los datos.';
        this.submitting = false;
      },
      complete: () => (this.submitting = false),
    });
  }

  cancel(): void {
    this.router.navigate(['/branches']);
  }
}
