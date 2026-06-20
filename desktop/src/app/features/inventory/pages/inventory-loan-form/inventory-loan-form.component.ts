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
        <button class="btn-secondary" (click)="cancel()">Volver</button>
      </div>

      @if (item) {
        <mat-card class="!rounded-xl !shadow-sm !mb-6">
          <mat-card-content class="!p-4">
            <p class="text-sm text-gray-600">
              <strong>Equipo:</strong> {{ item.name }} |
              <strong>Disponible:</strong> {{ item.availableQuantity }} /
              <strong>Total:</strong> {{ item.totalQuantity }}
            </p>
          </mat-card-content>
        </mat-card>

        <div class="card">
          <form (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label for="memberId">Miembro *</label>
              <select id="memberId" [(ngModel)]="dto.memberId" name="memberId" required>
                <option value="">Seleccionar miembro</option>
                @for (m of members(); track m.id) {
                  <option [value]="m.id">{{ m.fullName }}</option>
                }
              </select>
            </div>

            <div class="form-group">
              <label for="quantity">Cantidad</label>
              <input id="quantity" type="number" min="1" [max]="item.availableQuantity"
                     [(ngModel)]="dto.quantity" name="quantity" />
            </div>

            <div class="form-group">
              <label for="notes">Notas</label>
              <textarea id="notes" [(ngModel)]="dto.notes" name="notes" rows="2"
                        placeholder="Notas del préstamo..."></textarea>
            </div>

            @if (error) {
              <p class="error-msg">{{ error }}</p>
            }

            <div class="form-actions">
              <button type="button" class="btn-secondary" (click)="cancel()">Cancelar</button>
              <button type="submit" class="btn-primary" [disabled]="submitting">
                {{ submitting ? 'Guardando...' : 'Prestar' }}
              </button>
            </div>
          </form>
        </div>
      } @else {
        <div class="loading">Cargando...</div>
      }
    </div>
  `,
  styles: [`
    .page { padding: 24px; max-width: 600px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h1 { margin: 0; font-size: 22px; color: #1a1a2e; }
    .card { background: white; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); padding: 24px; }
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
    .loading { text-align: center; padding: 40px; color: #999; }
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
