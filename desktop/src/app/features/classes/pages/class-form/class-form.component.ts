import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ClassService, GymClass, CreateClassDto, Schedule, CreateScheduleDto } from '../../services/class.service';

const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

@Component({
  selector: 'app-class-form',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatCardModule, MatIconModule],
  template: `
    <div class="p-6 max-w-2xl">
      <div class="flex justify-between items-center mb-6">
        <h1 class="m-0 text-xl text-slate-900">{{ isEdit ? 'Editar clase' : 'Nueva clase' }}</h1>
        <button mat-stroked-button (click)="cancel()">Volver</button>
      </div>

      <mat-card>
        <form (ngSubmit)="onSubmit()" #form="ngForm" class="p-4">
          <div class="flex gap-4">
            <mat-form-field appearance="outline" class="flex-1">
              <mat-label>Nombre *</mat-label>
              <input matInput id="name" type="text" [(ngModel)]="dto.name" name="name" required placeholder="Ej: Spinning" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="w-32">
              <mat-label>Capacidad *</mat-label>
              <input matInput id="capacity" type="number" [(ngModel)]="dto.capacity" name="capacity" required min="1" />
            </mat-form-field>
            <div class="w-40">
              <span class="text-sm font-medium text-slate-700">Color</span>
              <div class="flex gap-2 items-center mt-1">
                <input id="color" type="color" [(ngModel)]="dto.color" name="color" class="w-10 h-10 p-0.5 cursor-pointer border-0" />
                <mat-form-field appearance="outline" class="flex-1">
                  <input matInput type="text" [(ngModel)]="dto.color" name="colorText" maxlength="7" placeholder="#4F46E5" />
                </mat-form-field>
              </div>
            </div>
          </div>

          <mat-form-field appearance="outline" class="w-full mt-4">
            <mat-label>Descripción</mat-label>
            <textarea matInput id="description" [(ngModel)]="dto.description" name="description" rows="2" placeholder="Descripción opcional..."></textarea>
          </mat-form-field>

          <div class="border-t border-slate-200 pt-4 mt-4">
            <div class="flex items-center justify-between mb-3">
              <span class="font-semibold text-sm text-slate-700">Horarios</span>
              <button mat-stroked-button type="button" (click)="addSchedule()">
                <mat-icon class="text-sm">add</mat-icon> Agregar horario
              </button>
            </div>
            @if (schedules().length === 0) {
              <p class="text-slate-500 text-sm italic">Sin horarios. Agregá al menos un horario.</p>
            }
            @for (s of schedules(); track $index; let i = $index) {
              <div class="flex gap-3 items-end mb-2 p-3 bg-slate-50 rounded-lg">
                <mat-form-field appearance="outline" class="flex-1">
                  <mat-label>Día</mat-label>
                  <mat-select [(ngModel)]="s.dayOfWeek" name="day_{{$index}}">
                    @for (d of DAY_NAMES; track $index) {
                      <mat-option [value]="$index">{{ d }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
                <div class="w-28">
                  <label class="text-xs font-medium text-slate-700 mb-1 block">Desde</label>
                  <input type="time" [(ngModel)]="s.startTime" name="start_{{$index}}" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div class="w-28">
                  <label class="text-xs font-medium text-slate-700 mb-1 block">Hasta</label>
                  <input type="time" [(ngModel)]="s.endTime" name="end_{{$index}}" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <button mat-icon-button type="button" (click)="removeSchedule(i)" class="text-red-500">
                  <mat-icon>close</mat-icon>
                </button>
              </div>
            }
          </div>

          @if (error) {
            <p class="text-red-600 text-sm mb-4">{{ error }}</p>
          }

          <div class="flex justify-end gap-3 mt-4">
            <button mat-stroked-button type="button" (click)="cancel()">Cancelar</button>
            <button mat-flat-button type="submit" color="primary" [disabled]="submitting">
              {{ submitting ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </form>
      </mat-card>
    </div>
  `,
  styles: [],
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
    color: '#4F46E5',
    description: '',
  };
  schedules = signal<CreateScheduleDto[]>([]);
  private existingSchedules: Schedule[] = [];
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
            color: c.color || '#4F46E5',
            description: c.description || '',
          };
          this.existingSchedules = c.schedules || [];
          this.schedules.set(c.schedules.map((s) => ({
            dayOfWeek: s.dayOfWeek,
            startTime: s.startTime.slice(0, 5),
            endTime: s.endTime.slice(0, 5),
          })));
        },
        error: () => this.router.navigate(['/classes']),
      });
    }
  }

  addSchedule(): void {
    this.schedules.update((s) => [...s, { dayOfWeek: 1, startTime: '08:00', endTime: '09:00' }]);
  }

  removeSchedule(index: number): void {
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
        const ops: Promise<any>[] = [];
        const currentSchedules = this.schedules();

        if (this.isEdit) {
          for (const s of this.existingSchedules) {
            ops.push(this.classService.removeSchedule(classId, s.id).toPromise());
          }
        }

        for (const s of currentSchedules) {
          ops.push(this.classService.addSchedule(classId, s).toPromise());
        }

        if (ops.length > 0) {
          Promise.all(ops).then(() => this.router.navigate(['/classes']));
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
