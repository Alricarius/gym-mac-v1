import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { InventoryItemService, CreateInventoryItemDto } from '../../services/inventory-item.service';
import { BranchStore, Branch } from '../../../../core/services/branch-store.service';

@Component({
  selector: 'app-inventory-form',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>{{ isEdit ? 'Editar equipo' : 'Nuevo equipo' }}</h1>
        <button mat-stroked-button (click)="cancel()">Volver</button>
      </div>

      <mat-card>
        <form (ngSubmit)="onSubmit()">
          <mat-form-field appearance="outline">
            <mat-label>Sucursal *</mat-label>
            <mat-select id="branchId" [(ngModel)]="dto.branchId" name="branchId" required>
              <mat-option value="">Seleccionar sucursal</mat-option>
              @for (branch of branches(); track branch.id) {
                <mat-option [value]="branch.id">{{ branch.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Nombre del equipo *</mat-label>
            <input id="name" matInput type="text" [(ngModel)]="dto.name" name="name" required placeholder="Ej: Pesa 10kg" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Descripción</mat-label>
            <textarea id="description" matInput [(ngModel)]="dto.description" name="description" rows="2" placeholder="Descripción del equipo..."></textarea>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Cantidad total</mat-label>
            <input id="totalQuantity" matInput type="number" min="1" [(ngModel)]="dto.totalQuantity" name="totalQuantity" />
          </mat-form-field>

          @if (error) {
            <p class="error-msg">{{ error }}</p>
          }

          <div class="form-actions">
            <button mat-stroked-button type="button" (click)="cancel()">Cancelar</button>
            <button mat-raised-button color="primary" type="submit" [disabled]="submitting">
              {{ submitting ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </form>
      </mat-card>
    </div>
  `,
  styles: [`
    .page { padding: 24px; max-width: 600px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h1 { margin: 0; font-size: 22px; color: var(--color-text-primary); }
    mat-card { padding: 24px; }
    mat-form-field { width: 100%; margin-bottom: 4px; }
    .error-msg { color: var(--color-error-text); background: var(--color-error-bg); padding: 10px 14px; border-radius: var(--radius-md); font-size: 13px; margin-bottom: 16px; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 16px; }
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
