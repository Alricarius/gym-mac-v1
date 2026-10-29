import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { HttpClient } from '@angular/common/http';
import {
  InventoryItemService, InventoryItem, CreateLoanDto,
} from '../../services/inventory-item.service';

interface MemberOption {
  id: string;
  fullName: string;
}

@Component({
  selector: 'app-inventory-loan-form',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatCardModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Prestar equipo</h1>
        <button mat-stroked-button (click)="cancel()">Volver</button>
      </div>

      @if (item) {
        <mat-card class="!rounded-xl !shadow-sm !mb-6">
          <mat-card-content class="!p-4">
            <p class="text-sm text-slate-600">
              <strong>Equipo:</strong> {{ item.name }} |
              <strong>Disponible:</strong> {{ item.availableQuantity }} /
              <strong>Total:</strong> {{ item.totalQuantity }}
            </p>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-content>
            <form (ngSubmit)="onSubmit()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Miembro *</mat-label>
                <mat-select [(ngModel)]="dto.memberId" name="memberId" required>
                  <mat-option value="">Seleccionar miembro</mat-option>
                  @for (m of members(); track m.id) {
                    <mat-option [value]="m.id">{{ m.fullName }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Cantidad</mat-label>
                <input matInput id="quantity" type="number" min="1" [max]="item.availableQuantity"
                       [(ngModel)]="dto.quantity" name="quantity" />
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Notas</mat-label>
                <textarea matInput id="notes" [(ngModel)]="dto.notes" name="notes" rows="2"
                          placeholder="Notas del préstamo..."></textarea>
              </mat-form-field>

              @if (error) {
                <p class="error-msg">{{ error }}</p>
              }

              <div class="form-actions">
                <button mat-stroked-button type="button" (click)="cancel()">Cancelar</button>
                <button mat-raised-button color="primary" type="submit" [disabled]="submitting">
                  {{ submitting ? 'Guardando...' : 'Prestar' }}
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      } @else {
        <div class="loading">Cargando...</div>
      }
    </div>
  `,
  styles: [`
    .page { padding: 24px; max-width: 600px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h1 { margin: 0; font-size: 22px; color: var(--color-text-primary); }
    .full-width { width: 100%; margin-bottom: 16px; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 16px; }
    .error-msg { color: var(--color-error-text); background: var(--color-error-bg); padding: 10px 14px; border-radius: var(--radius-md); font-size: 13px; margin-bottom: 16px; }
    .loading { text-align: center; padding: 40px; color: var(--color-text-muted); }
  `],
})
export class InventoryLoanFormComponent implements OnInit {
  private readonly inventoryService = inject(InventoryItemService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  readonly members = signal<MemberOption[]>([]);
  item: InventoryItem | null = null;
  dto: CreateLoanDto = { memberId: '', quantity: 1, notes: '' };
  submitting = false;
  error = '';

  ngOnInit(): void {
    const itemId = this.route.snapshot.paramMap.get('itemId');
    if (!itemId) {
      this.router.navigate(['/inventory']);
      return;
    }

    this.inventoryService.findById(itemId).subscribe({
      next: (item) => {
        this.item = item;
        this.dto.quantity = 1;
      },
      error: () => this.router.navigate(['/inventory']),
    });

    this.http.get<MemberOption[]>('http://localhost:3000/api/v1/members?limit=200').subscribe({
      next: (res: any) => this.members.set(res.data || res),
    });
  }

  onSubmit(): void {
    if (!this.dto.memberId || !this.item) return;
    this.submitting = true;
    this.error = '';

    const cleaned: CreateLoanDto = { memberId: this.dto.memberId, quantity: this.dto.quantity || 1 };
    if (this.dto.notes) cleaned.notes = this.dto.notes;

    this.inventoryService.loan(this.item.id, cleaned).subscribe({
      next: () => this.router.navigate(['/inventory']),
      error: () => {
        this.error = 'Error al registrar préstamo. Verifique el stock disponible.';
        this.submitting = false;
      },
      complete: () => (this.submitting = false),
    });
  }

  cancel(): void {
    this.router.navigate(['/inventory']);
  }
}
