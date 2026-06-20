import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ClassService, GymClass, CreateClassDto, Schedule, CreateScheduleDto } from '../../services/class.service';

const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

@Component({
  selector: 'app-class-form',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatIconModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>{{ isEdit ? 'Editar clase' : 'Nueva clase' }}</h1>
        <button class="btn-secondary" (click)="cancel()">Volver</button>
      </div>

      <div class="card">
        <form (ngSubmit)="onSubmit()" #form="ngForm">
          <div class="form-row">
            <div class="form-group flex-1">
              <label for="name">Nombre *</label>
              <input id="name" type="text" [(ngModel)]="dto.name" name="name" required placeholder="Ej: Spinning" />
            </div>
            <div class="form-group w-32">
              <label for="capacity">Capacidad *</label>
              <input id="capacity" type="number" [(ngModel)]="dto.capacity" name="capacity" required min="1" />
            </div>
            <div class="form-group w-40">
              <label for="color">Color</label>
              <div class="flex gap-2 items-center">
                <input id="color" type="color" [(ngModel)]="dto.color" name="color" class="!w-10 !h-10 !p-0.5 !cursor-pointer" />
                <input type="text" [(ngModel)]="dto.color" name="colorText" maxlength="7" placeholder="#667eea" class="flex-1" />
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="description">Descripción</label>
            <textarea id="description" [(ngModel)]="dto.description" name="description" rows="2" placeholder="Descripción opcional..."></textarea>
          </div>

          <div class="border-t border-gray-200 pt-4 mt-4">
            <div class="flex items-center justify-between mb-3">
              <label class="!mb-0 font-semibold text-sm text-gray-700">Horarios</label>
              <button type="button" class="btn-secondary text-sm !py-1.5 !px-3" (click)="addSchedule()">
                <mat-icon class="text-sm">add</mat-icon> Agregar horario
              </button>
            </div>
            @if (schedules().length === 0) {
              <p class="text-gray-400 text-sm italic">Sin horarios. Agregá al menos un horario.</p>
            }
            @for (s of schedules(); track $index; let i = $index) {
              <div class="flex gap-3 items-end mb-2 p-3 bg-gray-50 rounded-lg">
                <div class="form-group !mb-0 flex-1">
                  <label class="text-xs">Día</label>
                  <select [(ngModel)]="s.dayOfWeek" name="day_{{$index}}" class="!py-2">
                    @for (d of DAY_NAMES; track $index) {
                      <option [value]="$index">{{ d }}</option>
                    }
                  </select>
                </div>
                <div class="form-group !mb-0 w-28">
                  <label class="text-xs">Desde</label>
                  <input type="time" [(ngModel)]="s.startTime" name="start_{{$index}}" class="!py-2" />
                </div>
                <div class="form-group !mb-0 w-28">
                  <label class="text-xs">Hasta</label>
                  <input type="time" [(ngModel)]="s.endTime" name="end_{{$index}}" class="!py-2" />
                </div>
                <button type="button" class="btn-icon !text-red-500" (click)="removeSchedule(i)">
                  <mat-icon>close</mat-icon>
                </button>
              </div>
            }
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
    .btn-icon { background: none; border: none; cursor: pointer; padding: 6px; border-radius: 6px; display: flex; align-items: center; transition: background 0.2s; }
    .btn-icon:hover { background: #f5f5f5; }
  `],
})
export class ClassFormComponent implements OnInit {
  readonly DAY_NAMES = DAY_NAMES;
  private readonly classService = inject(ClassService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  isEdit = false;
  classId = '';
  dto: CreateClassDto = {
    name: '',
    capacity: 20,
    color: '#667eea',
    description: '',
  };
  schedules = signal<CreateScheduleDto[]>([]);
  private existingSchedules: Schedule[] = [];
  private removedScheduleIds: string[] = [];
  submitting = false;
  error = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.classId = id;
      this.classService.findById(id).subscribe({
        next: (c) => {
          this.dto = {
            name: c.name,
            capacity: c.capacity,
            color: c.color || '#667eea',
            description: c.description || '',
          };
          this.existingSchedules = c.schedules || [];
          this.schedules.set(c.schedules?.map((s) => ({
            dayOfWeek: s.dayOfWeek,
            startTime: s.startTime?.slice(0, 5),
            endTime: s.endTime?.slice(0, 5),
          })) || []);
        },
        error: () => this.router.navigate(['/classes']),
      });
    }
  }

  addSchedule(): void {
    this.schedules.update((s) => [...s, { dayOfWeek: 1, startTime: '08:00', endTime: '09:00' }]);
  }

  removeSchedule(index: number): void {
    const removed = this.existingSchedules[index];
    if (removed?.id) {
      this.removedScheduleIds.push(removed.id);
    }
    this.schedules.update((s) => s.filter((_, i) => i !== index));
  }

  onSubmit(): void {
    if (!this.dto.name.trim()) return;
    this.submitting = true;
    this.error = '';

    const req = this.isEdit
      ? this.classService.update(this.classId, this.dto)
      : this.classService.create(this.dto);

    req.subscribe({
      next: (c) => {
        const classId = c.id;
        const scheduleOps = [];

        for (const remId of this.removedScheduleIds) {
          scheduleOps.push(this.classService.removeSchedule(classId, remId).toPromise());
        }

        const currentSchedules = this.schedules();
        const existingCount = this.existingSchedules.length;
        for (let i = 0; i < currentSchedules.length; i++) {
          const s = currentSchedules[i];
          if (i < existingCount) continue;
          scheduleOps.push(this.classService.addSchedule(classId, s).toPromise());
        }

        if (scheduleOps.length > 0) {
          Promise.all(scheduleOps).then(() => this.router.navigate(['/classes']));
        } else {
          this.router.navigate(['/classes']);
        }
      },
      error: () => {
        this.error = 'Error al guardar. Verifique los datos.';
        this.submitting = false;
      },
      complete: () => (this.submitting = false),
    });
  }

  cancel(): void {
    this.router.navigate(['/classes']);
  }
}
