import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MemberService, Member, CreateMemberDto } from '../../services/member.service';
import { BranchStore, Branch } from '../../../../core/services/branch-store.service';

@Component({
  selector: 'app-member-form',
  standalone: true,
  imports: [
    FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatDatepickerModule, MatCardModule, MatNativeDateModule,
  ],
  template: `
    <div class="page">
      <mat-card class="!rounded-xl !shadow-sm">
        <mat-card-header class="!pb-4">
          <mat-card-title>{{ isEdit ? 'Editar socio' : 'Nuevo socio' }}</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form (ngSubmit)="onSubmit()" #form="ngForm">
            <div class="form-row">
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Nombre completo *</mat-label>
                <input matInput [(ngModel)]="dto.fullName" name="fullName" required placeholder="Nombre del socio" />
              </mat-form-field>
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Email</mat-label>
                <input matInput type="email" [(ngModel)]="dto.email" name="email" placeholder="correo@ejemplo.com" />
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Teléfono</mat-label>
                <input matInput [(ngModel)]="dto.phone" name="phone" placeholder="555-0100" />
              </mat-form-field>
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Fecha de nacimiento</mat-label>
                <input matInput [matDatepicker]="picker" [(ngModel)]="birthDate" name="birthDate" />
                <mat-datepicker-toggle matSuffix [for]="picker" />
                <mat-datepicker #picker />
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Género</mat-label>
                <mat-select [(ngModel)]="dto.gender" name="gender">
                  <mat-option value="">Seleccionar</mat-option>
                  <mat-option value="male">Masculino</mat-option>
                  <mat-option value="female">Femenino</mat-option>
                  <mat-option value="other">Otro</mat-option>
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Dirección</mat-label>
                <input matInput [(ngModel)]="dto.address" name="address" placeholder="Dirección" />
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Sucursal</mat-label>
              <mat-select [(ngModel)]="dto.branchId" name="branchId">
                <mat-option value="">Sin asignar</mat-option>
                @for (branch of branches(); track branch.id) {
                  <mat-option [value]="branch.id">{{ branch.name }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Notas</mat-label>
              <textarea matInput [(ngModel)]="dto.notes" name="notes" rows="3" placeholder="Notas adicionales..."></textarea>
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
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page { padding: 24px; max-width: 720px; }
    .form-row { display: flex; gap: 16px; }
    .form-row mat-form-field { flex: 1; }
    .error-msg { color: var(--color-error-text); background: var(--color-error-bg); padding: 10px 14px; border-radius: var(--radius-md); font-size: 13px; margin-bottom: 16px; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 16px; }
  `],
})
export class MemberFormComponent implements OnInit {
  private readonly memberService = inject(MemberService);
  private readonly branchStore = inject(BranchStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly branches = signal<Branch[]>([]);

  isEdit = false;
  memberId = '';
  dto: CreateMemberDto = {
    fullName: '',
    email: '',
    phone: '',
    birthDate: '',
    gender: '',
    address: '',
    notes: '',
    branchId: '',
  };
  birthDate: Date | null = null;
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
      this.memberId = id;
      this.memberService.findById(id).subscribe({
        next: (member) => {
          this.dto = {
            fullName: member.fullName,
            email: member.email || '',
            phone: member.phone || '',
            birthDate: member.birthDate || '',
            gender: member.gender || '',
            address: member.address || '',
            notes: member.notes || '',
            branchId: member.branchId || '',
          };
          this.birthDate = member.birthDate ? new Date(member.birthDate) : null;
        },
        error: () => this.router.navigate(['/members']),
      });
    } else {
      const selected = this.branchStore.selectedBranch();
      if (selected) this.dto.branchId = selected.id;
    }
  }

  onSubmit(): void {
    if (!this.dto.fullName.trim()) return;
    this.submitting = true;
    this.error = '';

    const cleaned = { ...this.dto };
    cleaned.birthDate = this.birthDate ? this.birthDate.toISOString().split('T')[0] : '';
    Object.keys(cleaned).forEach((k) => {
      if (!(cleaned as any)[k]) delete (cleaned as any)[k];
    });
    cleaned.fullName = this.dto.fullName.trim();

    const req = this.isEdit
      ? this.memberService.update(this.memberId, cleaned)
      : this.memberService.create(cleaned);

    req.subscribe({
      next: () => this.router.navigate(['/members']),
      error: () => {
        this.error = 'Error al guardar. Verifique los datos.';
        this.submitting = false;
      },
      complete: () => (this.submitting = false),
    });
  }

  cancel(): void {
    this.router.navigate(['/members']);
  }
}
