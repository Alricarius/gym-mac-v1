import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MemberService, Member, CreateMemberDto } from '../../services/member.service';

@Component({
  selector: 'app-member-form',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>{{ isEdit ? 'Editar socio' : 'Nuevo socio' }}</h1>
        <button class="btn-secondary" (click)="cancel()">Volver</button>
      </div>

      <div class="card">
        <form (ngSubmit)="onSubmit()" #form="ngForm">
          <div class="form-row">
            <div class="form-group">
              <label for="fullName">Nombre completo *</label>
              <input id="fullName" type="text" [(ngModel)]="dto.fullName" name="fullName" required placeholder="Nombre del socio" />
            </div>
            <div class="form-group">
              <label for="email">Email</label>
              <input id="email" type="email" [(ngModel)]="dto.email" name="email" placeholder="correo@ejemplo.com" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="phone">Teléfono</label>
              <input id="phone" type="text" [(ngModel)]="dto.phone" name="phone" placeholder="555-0100" />
            </div>
            <div class="form-group">
              <label for="birthDate">Fecha de nacimiento</label>
              <input id="birthDate" type="date" [(ngModel)]="dto.birthDate" name="birthDate" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="gender">Género</label>
              <select id="gender" [(ngModel)]="dto.gender" name="gender">
                <option value="">Seleccionar</option>
                <option value="male">Masculino</option>
                <option value="female">Femenino</option>
                <option value="other">Otro</option>
              </select>
            </div>
            <div class="form-group">
              <label for="address">Dirección</label>
              <input id="address" type="text" [(ngModel)]="dto.address" name="address" placeholder="Dirección" />
            </div>
          </div>

          <div class="form-group">
            <label for="notes">Notas</label>
            <textarea id="notes" [(ngModel)]="dto.notes" name="notes" rows="3" placeholder="Notas adicionales..."></textarea>
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
    .page { padding: 24px; max-width: 720px; }
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
export class MemberFormComponent implements OnInit {
  private readonly memberService = inject(MemberService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

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
  };
  submitting = false;
  error = '';

  ngOnInit(): void {
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
          };
        },
        error: () => this.router.navigate(['/members']),
      });
    }
  }

  onSubmit(): void {
    if (!this.dto.fullName.trim()) return;
    this.submitting = true;
    this.error = '';

    const cleaned = { ...this.dto };
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
