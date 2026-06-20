import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { InventoryItemService, CreateInventoryItemDto } from '../../services/inventory-item.service';
import { BranchStore, Branch } from '../../../../core/services/branch-store.service';

@Component({
  selector: 'app-inventory-form',
  standalone: true,
  imports: [FormsModule, MatSelectModule, MatFormFieldModule, MatInputModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>{{ isEdit ? 'Editar equipo' : 'Nuevo equipo' }}</h1>
        <button class="btn-secondary" (click)="cancel()">Volver</button>
      </div>

      <div class="card">
        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="branchId">Sucursal *</label>
            <select id="branchId" [(ngModel)]="dto.branchId" name="branchId" required>
              <option value="">Seleccionar sucursal</option>
              @for (branch of branches(); track branch.id) {
                <option [value]="branch.id">{{ branch.name }}</option>
              }
            </select>
          </div>

          <div class="form-group">
            <label for="name">Nombre del equipo *</label>
            <input id="name" type="text" [(ngModel)]="dto.name" name="name" required placeholder="Ej: Pesa 10kg" />
          </div>

          <div class="form-group">
            <label for="description">Descripción</label>
            <textarea id="description" [(ngModel)]="dto.description" name="description" rows="2" placeholder="Descripción del equipo..."></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="totalQuantity">Cantidad total</label>
              <input id="totalQuantity" type="number" min="1" [(ngModel)]="dto.totalQuantity" name="totalQuantity" />
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
export class InventoryFormComponent implements OnInit {
  private readonly inventoryService = inject(InventoryItemService);
  private readonly branchStore = inject(BranchStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly branches = signal<Branch[]>([]);

  isEdit = false;
  itemId = '';
  dto: CreateInventoryItemDto = {
    branchId: '',
    name: '',
    description: '',
    totalQuantity: 1,
  };
  submitting = false;
  error = '';

  ngOnInit(): void {
    this.branches.set(this.branchStore.branches());
    if (this.branches().length === 0) {
      this.branchStore.loadBranches();
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.itemId = id;
      this.inventoryService.findById(id).subscribe({
        next: (item) => {
          this.dto = {
            branchId: item.branchId,
            name: item.name,
            description: item.description || '',
            totalQuantity: item.totalQuantity,
          };
        },
        error: () => this.router.navigate(['/inventory']),
      });
    } else {
      const selected = this.branchStore.selectedBranch();
      if (selected) this.dto.branchId = selected.id;
    }
  }

  onSubmit(): void {
    if (!this.dto.name.trim() || !this.dto.branchId) return;
    this.submitting = true;
    this.error = '';

    const cleaned = { ...this.dto };
    Object.keys(cleaned).forEach((k) => {
      if ((cleaned as any)[k] === '' || (cleaned as any)[k] === undefined) {
        delete (cleaned as any)[k];
      }
    });
    cleaned.name = this.dto.name.trim();

    const req = this.isEdit
      ? this.inventoryService.update(this.itemId, cleaned)
      : this.inventoryService.create(cleaned);

    req.subscribe({
      next: () => this.router.navigate(['/inventory']),
      error: () => {
        this.error = 'Error al guardar. Verifique los datos.';
        this.submitting = false;
      },
      complete: () => (this.submitting = false),
    });
  }

  cancel(): void {
    this.router.navigate(['/inventory']);
  }
}
