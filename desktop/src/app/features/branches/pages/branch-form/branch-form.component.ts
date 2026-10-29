import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute, Router } from '@angular/router';
import { BranchService, CreateBranchDto } from '../../services/branch.service';

@Component({
  selector: 'app-branch-form',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatCardModule],
  template: `
    <div class="page">
      <mat-card class="!rounded-xl !shadow-sm">
        <mat-card-header>
          <mat-card-title>{{ isEdit ? 'Editar sucursal' : 'Nueva sucursal' }}</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <form (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Nombre *</mat-label>
              <input matInput id="name" type="text" [(ngModel)]="dto.name" name="name" required placeholder="Nombre de la sucursal" />
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Dirección</mat-label>
              <input matInput id="address" type="text" [(ngModel)]="dto.address" name="address" placeholder="Dirección" />
            </mat-form-field>

            <div class="flex gap-4">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Teléfono</mat-label>
                <input matInput id="phone" type="text" [(ngModel)]="dto.phone" name="phone" placeholder="555-0000" />
              </mat-form-field>
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Email</mat-label>
                <input matInput id="email" type="email" [(ngModel)]="dto.email" name="email" placeholder="correo@ejemplo.com" />
              </mat-form-field>
            </div>

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
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page { padding: 24px; max-width: 600px; }
    .error-msg { color: var(--color-error-text); background: var(--color-error-bg); padding: 10px 14px; border-radius: var(--radius-md); font-size: 13px; margin-bottom: 16px; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 16px; }
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
