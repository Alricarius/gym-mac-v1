import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BookingService, CreateBookingDto } from '../../services/booking.service';
import { ClassService, GymClass } from '../../../classes/services/class.service';
import { MemberService, Member } from '../../../members/services/member.service';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [
    FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatIconModule,
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Nueva reserva</h1>
        <button mat-stroked-button (click)="cancel()">Volver</button>
      </div>

      <div class="card">
        <form (ngSubmit)="onSubmit()" #form="ngForm">
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
            <label for="classId">Clase *</label>
            <select id="classId" [(ngModel)]="dto.classId" name="classId" required (ngModelChange)="onClassChange()">
              <option value="">Seleccionar clase</option>
              @for (c of classes(); track c.id) {
                <option [value]="c.id">{{ c.name }} (cap. {{ c.capacity }})</option>
              }
            </select>
          </div>

          @if (availableSchedules().length > 0) {
            <div class="form-group">
              <label for="scheduleId">Horario *</label>
              <select id="scheduleId" [(ngModel)]="dto.scheduleId" name="scheduleId" required>
                <option value="">Seleccionar horario</option>
                @for (s of availableSchedules(); track s.id) {
                  <option [value]="s.id">
                    {{ DAY_NAMES[s.dayOfWeek] }} {{ s.startTime.slice(0, 5) }} - {{ s.endTime.slice(0, 5) }}
                  </option>
                }
              </select>
            </div>
          }

          <div class="form-group">
            <label for="bookingDate">Fecha *</label>
            <input id="bookingDate" type="date" [(ngModel)]="dto.bookingDate" name="bookingDate" required
              [min]="todayStr" />
          </div>

          @if (error) {
            <p class="error-msg">{{ error }}</p>
          }

          <div class="form-actions">
            <button mat-stroked-button type="button" (click)="cancel()">Cancelar</button>
            <button mat-raised-button color="primary" type="submit" [disabled]="submitting">
              {{ submitting ? 'Reservando...' : 'Reservar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 24px; max-width: 640px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h1 { margin: 0; font-size: 22px; color: var(--color-text-primary); }
    .card { background: var(--color-surface); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); padding: 24px; }
    .form-group { margin-bottom: 20px; }
    label { display: block; margin-bottom: 6px; font-size: 13px; font-weight: 600; color: var(--color-text-heading); }
    input, select { width: 100%; padding: 10px 14px; border: 1px solid var(--color-border); border-radius: var(--radius-md); font-size: 14px; box-sizing: border-box; transition: border-color 0.2s; font-family: inherit; background: white; }
    input:focus, select:focus { outline: none; border-color: var(--color-primary); }
    .error-msg { color: var(--color-error-text); background: var(--color-error-bg); padding: 10px 14px; border-radius: var(--radius-md); font-size: 13px; margin-bottom: 16px; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 16px; }
  `],
})
export class BookingFormComponent implements OnInit {
  readonly DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  private readonly snackBar = inject(MatSnackBar);
  private readonly bookingService = inject(BookingService);
  private readonly classService = inject(ClassService);
  private readonly memberService = inject(MemberService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly members = signal<Member[]>([]);
  readonly classes = signal<GymClass[]>([]);
  readonly availableSchedules = signal<any[]>([]);

  dto: CreateBookingDto = {
    memberId: '',
    classId: '',
    scheduleId: '',
    bookingDate: '',
  };

  todayStr = new Date().toISOString().slice(0, 10);
  submitting = false;
  error = '';

  ngOnInit(): void {
    this.loadMembers();
    this.loadClasses();

    const date = this.route.snapshot.queryParamMap.get('date');
    if (date) this.dto.bookingDate = date;

    const classId = this.route.snapshot.queryParamMap.get('classId');
    if (classId) {
      this.dto.classId = classId;
      this.onClassChange();
    }
  }

  private loadMembers(): void {
    this.memberService.findAll().subscribe({
      next: (res) => this.members.set(res.data),
    });
  }

  private loadClasses(): void {
    this.classService.findAll().subscribe({
      next: (res) => this.classes.set(res.data),
    });
  }

  onClassChange(): void {
    if (!this.dto.classId) {
      this.availableSchedules.set([]);
      return;
    }
    const c = this.classes().find((x) => x.id === this.dto.classId);
    this.availableSchedules.set(c?.schedules?.filter((s) => s.isActive) || []);
    this.dto.scheduleId = '';
  }

  onSubmit(): void {
    if (!this.dto.memberId || !this.dto.classId || !this.dto.scheduleId || !this.dto.bookingDate) {
      this.error = 'Todos los campos son obligatorios';
      return;
    }
    this.submitting = true;
    this.error = '';

    this.bookingService.create(this.dto).subscribe({
      next: (res) => {
        const msg = res.status === 'waitlisted' ? 'Clase llena. Se agregó a lista de espera.' : 'Reserva confirmada.';
        this.snackBar.open(msg, 'Cerrar', { duration: 5000 });
        this.router.navigate(['/bookings']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al crear reserva.';
        this.submitting = false;
      },
      complete: () => (this.submitting = false),
    });
  }

  cancel(): void {
    this.router.navigate(['/bookings']);
  }
}
