import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService, SystemUser, CreateUserDto } from '../../services/user.service';
import { AuthStore } from '../../../auth/services/auth.store';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>{{ isEdit ? 'Editar usuario' : 'Nuevo usuario' }}</h1>
        <button class="btn-secondary" (click)="cancel()">Volver</button>
      </div>

      <div class="card">
        <form (ngSubmit)="onSubmit()" #form="ngForm">
          <div class="form-row">
            <div class="form-group">
              <label for="fullName">Nombre completo *</label>
              <input id="fullName" type="text" [(ngModel)]="dto.fullName" name="fullName" required placeholder="Nombre del usuario" />
            </div>
            <div class="form-group">
              <label for="email">Email *</label>
              <input id="email" type="email" [(ngModel)]="dto.email" name="email" required placeholder="correo@ejemplo.com" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="password">{{ isEdit ? 'Nueva contraseña (dejar vacío para mantener)' : 'Contraseña *' }}</label>
              <input id="password" type="password" [(ngModel)]="dto.password" name="password"
                     [required]="!isEdit" placeholder="Mínimo 6 caracteres" />
            </div>
            <div class="form-group">
              <label for="role">Rol *</label>
              <select id="role" [(ngModel)]="dto.role" name="role" required>
                <option value="admin">Admin</option>
                <option value="receptionist">Recepcionista</option>
                <option value="trainer">Instructor</option>
              </select>
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
    .page { padding: 24px; max-width: 720px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h1 { margin: 0; font-size: 22px; color: #1a1a2e; }
    .card { background: white; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); padding: 24px; }
    .form-row { display: flex; gap: 16px; }
    .form-row .form-group { flex: 1; }
    .form-group { margin-bottom: 20px; }
    label { display: block; margin-bottom: 6px; font-size: 13px; font-weight: 600; color: #333; }
    input, select { width: 100%; padding: 10px 14px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; box-sizing: border-box; transition: border-color 0.2s; font-family: inherit; }
    input:focus, select:focus { outline: none; border-color: #667eea; }
    .error-msg { color: #e74c3c; font-size: 13px; margin-bottom: 16px; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px; }
    .btn-primary { padding: 10px 24px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; transition: background 0.2s; }
    .btn-primary:hover:not(:disabled) { background: #5a6fd6; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-secondary { padding: 10px 24px; border: 1px solid #ddd; background: white; border-radius: 8px; cursor: pointer; font-size: 14px; transition: all 0.2s; }
    .btn-secondary:hover { background: #f5f5f5; }
  `],
})
export class UserFormComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  isEdit = false;
  userId = '';
  dto: CreateUserDto & { password?: string } = {
    fullName: '',
    email: '',
    password: '',
    role: 'receptionist',
  };
  submitting = false;
  error = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.userId = id;
      this.userService.findById(id).subscribe({
        next: (user) => {
          this.dto = {
            fullName: user.fullName,
            email: user.email,
            password: '',
            role: user.role,
          };
        },
        error: () => this.router.navigate(['/users']),
      });
    }
  }

  onSubmit(): void {
    if (!this.dto.fullName.trim() || !this.dto.email.trim()) return;
    this.submitting = true;
    this.error = '';

    const cleaned: Record<string, any> = { ...this.dto };
    if (!cleaned['password']) delete cleaned['password'];

    const req = this.isEdit
      ? this.userService.update(this.userId, cleaned)
      : this.userService.create(cleaned as CreateUserDto);

    req.subscribe({
      next: () => this.router.navigate(['/users']),
      error: () => {
        this.error = 'Error al guardar. Verifique los datos.';
        this.submitting = false;
      },
      complete: () => (this.submitting = false),
    });
  }

  cancel(): void {
    this.router.navigate(['/users']);
  }
}
