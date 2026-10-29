import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { SettingsService, GymConfig } from '../../services/settings.service';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
const DAY_LABELS: Record<string, string> = {
  monday: 'Lunes', tuesday: 'Martes', wednesday: 'Miércoles',
  thursday: 'Jueves', friday: 'Viernes', saturday: 'Sábado', sunday: 'Domingo',
};

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatCardModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Configuración del gimnasio</h1>
      </div>

      <mat-card class="!rounded-xl !shadow-sm">
        <mat-card-content class="!p-6">
          @if (loading) {
            <div class="loading">Cargando...</div>
          } @else {
            <form (ngSubmit)="onSubmit()" #form="ngForm">
              <div class="form-section">
                <h2>Información general</h2>
                <div class="form-row">
                  <div class="form-group">
                    <label for="gymName">Nombre del gimnasio *</label>
                    <input id="gymName" type="text" [(ngModel)]="formData.gymName" name="gymName" required placeholder="Ej: GymAdmin Fit" />
                  </div>
                  <div class="form-group">
                    <label for="phone">Teléfono</label>
                    <input id="phone" type="text" [(ngModel)]="formData.phone" name="phone" placeholder="555-0100" />
                  </div>
                </div>
                <div class="form-group">
                  <label for="address">Dirección</label>
                  <input id="address" type="text" [(ngModel)]="formData.address" name="address" placeholder="Dirección del gimnasio" />
                </div>
              </div>

              <div class="form-section">
                <h2>Horarios de atención</h2>
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b border-slate-200">
                      <th class="text-left font-semibold text-slate-500 uppercase text-xs tracking-wider py-2 pr-4">Día</th>
                      <th class="text-left font-semibold text-slate-500 uppercase text-xs tracking-wider py-2 pr-4">Apertura</th>
                      <th class="text-left font-semibold text-slate-500 uppercase text-xs tracking-wider py-2">Cierre</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (day of days; track day) {
                      <tr class="border-b border-slate-100">
                        <td class="py-2 pr-4 font-medium text-slate-700">{{ dayLabel(day) }}</td>
                        <td class="py-2 pr-4">
                          <input type="time" class="input-time"
                            [ngModel]="openTime(day)" (ngModelChange)="setOpenTime(day, $event)" name="open_{{day}}" />
                        </td>
                        <td class="py-2">
                          <input type="time" class="input-time"
                            [ngModel]="closeTime(day)" (ngModelChange)="setCloseTime(day, $event)" name="close_{{day}}" />
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              <div class="form-section">
                <h2>Políticas</h2>
                <div class="form-row">
                  <div class="form-group">
                    <label for="graceDays">Días de gracia</label>
                    <input id="graceDays" type="number" [(ngModel)]="formData.graceDays" name="graceDays" min="0" />
                  </div>
                  <div class="form-group">
                    <label for="taxRate">Impuesto (%)</label>
                    <input id="taxRate" type="number" [(ngModel)]="formData.taxRate" name="taxRate" min="0" step="0.01" />
                  </div>
                </div>
                <div class="form-group">
                  <label for="timezone">Zona horaria</label>
                  <select id="timezone" [(ngModel)]="formData.timezone" name="timezone">
                    <option value="America/La_Paz">América/La Paz (UTC-4)</option>
                    <option value="America/Argentina/Buenos_Aires">América/Argentina/Buenos_Aires (UTC-3)</option>
                    <option value="America/Santiago">América/Santiago (UTC-4)</option>
                    <option value="America/Bogota">América/Bogotá (UTC-5)</option>
                    <option value="America/Lima">América/Lima (UTC-5)</option>
                    <option value="America/Mexico_City">América/México (UTC-6)</option>
                    <option value="America/New_York">América/New_York (UTC-5)</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="cancellationPolicy">Política de cancelación</label>
                  <textarea id="cancellationPolicy" [(ngModel)]="formData.cancellationPolicy" name="cancellationPolicy" rows="3" placeholder="Condiciones para cancelar reservas..."></textarea>
                </div>
              </div>

              @if (error) {
                <p class="error-msg">{{ error }}</p>
              }
              @if (success) {
                <p class="success-msg">Configuración guardada correctamente.</p>
              }

              <div class="form-actions">
                <button mat-raised-button color="primary" type="submit" [disabled]="submitting">
                  {{ submitting ? 'Guardando...' : 'Guardar configuración' }}
                </button>
              </div>
            </form>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page { padding: 24px; max-width: 860px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h1 { margin: 0; font-size: 22px; color: var(--color-text-primary); }
    .form-section { margin-bottom: 28px; }
    .form-section h2 { font-size: 16px; font-weight: 600; color: var(--color-text-heading); margin: 0 0 16px; padding-bottom: 8px; border-bottom: 1px solid var(--color-border); }
    .form-row { display: flex; gap: 16px; }
    .form-row .form-group { flex: 1; }
    .form-group { margin-bottom: 20px; }
    label { display: block; margin-bottom: 6px; font-size: 13px; font-weight: 600; color: var(--color-text-heading); }
    input, select, textarea { width: 100%; padding: 10px 14px; border: 1px solid var(--color-border); border-radius: var(--radius-md); font-size: 14px; box-sizing: border-box; transition: border-color 0.2s; font-family: inherit; }
    input:focus, select:focus, textarea:focus { outline: none; border-color: var(--color-primary); }
    .input-time { width: 100%; padding: 6px 10px; border: 1px solid var(--color-border); border-radius: 6px; font-size: 13px; }
    textarea { resize: vertical; }
    .error-msg { color: var(--color-error-text); font-size: 13px; margin-bottom: 16px; }
    .success-msg { color: var(--color-success-text); font-size: 13px; margin-bottom: 16px; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 16px; }
    .loading { text-align: center; padding: 40px; color: var(--color-text-secondary); }
  `],
})
export class SettingsComponent implements OnInit {
  private readonly settingsService = inject(SettingsService);

  readonly days = DAYS;
  dayLabel = (d: string) => DAY_LABELS[d] || d;

  formData = {
    gymName: '',
    address: '',
    phone: '',
    openingHours: {} as Record<string, string>,
    cancellationPolicy: '',
    graceDays: 0,
    taxRate: 0,
    timezone: 'America/La_Paz',
  };

  loading = true;
  submitting = false;
  error = '';
  success = false;

  ngOnInit(): void {
    this.settingsService.get().subscribe({
      next: (config) => {
        this.formData = {
          gymName: config.gymName,
          address: config.address || '',
          phone: config.phone || '',
          openingHours: config.openingHours || {},
          cancellationPolicy: config.cancellationPolicy || '',
          graceDays: config.graceDays,
          taxRate: Number(config.taxRate),
          timezone: config.timezone,
        };
        this.loading = false;
      },
      error: () => { this.loading = false; this.error = 'Error al cargar configuración.'; },
    });
  }

  openTime(day: string): string {
    const val = this.formData.openingHours?.[day];
    return val?.split('-')[0] || '';
  }

  closeTime(day: string): string {
    const val = this.formData.openingHours?.[day];
    return val?.split('-')[1] || '';
  }

  setOpenTime(day: string, value: string): void {
    const close = this.closeTime(day);
    this.formData.openingHours[day] = value && close ? `${value}-${close}` : '';
  }

  setCloseTime(day: string, value: string): void {
    const open = this.openTime(day);
    this.formData.openingHours[day] = open && value ? `${open}-${value}` : '';
  }

  onSubmit(): void {
    if (!this.formData.gymName.trim()) return;
    this.submitting = true;
    this.error = '';
    this.success = false;

    const payload = {
      gymName: this.formData.gymName.trim(),
      address: this.formData.address || undefined,
      phone: this.formData.phone || undefined,
      openingHours: this.formData.openingHours,
      cancellationPolicy: this.formData.cancellationPolicy || undefined,
      graceDays: Number(this.formData.graceDays),
      taxRate: Number(this.formData.taxRate),
      timezone: this.formData.timezone,
    };

    this.settingsService.update(payload).subscribe({
      next: () => { this.success = true; this.submitting = false; },
      error: () => { this.error = 'Error al guardar configuración.'; this.submitting = false; },
    });
  }
}
