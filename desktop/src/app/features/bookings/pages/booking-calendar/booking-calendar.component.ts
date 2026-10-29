import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { ClassService, GymClass } from '../../../classes/services/class.service';

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

@Component({
  selector: 'app-booking-calendar',
  standalone: true,
  imports: [DatePipe, MatButtonModule, MatIconModule, MatCardModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Reservas</h1>
        <button mat-raised-button color="primary" (click)="newBooking()">
          <mat-icon>add</mat-icon>
          Nueva reserva
        </button>
      </div>

      <mat-card class="!rounded-xl !shadow-sm">
        <mat-card-content class="!p-6">
          <div class="flex items-center justify-between mb-4">
            <button mat-stroked-button (click)="prevMonth()">
              <mat-icon>chevron_left</mat-icon>
            </button>
            <h2 class="text-lg font-semibold text-slate-800">{{ monthYear() }}</h2>
            <button mat-stroked-button (click)="nextMonth()">
              <mat-icon>chevron_right</mat-icon>
            </button>
          </div>

          <div class="grid grid-cols-7 gap-px bg-slate-200 rounded-lg overflow-hidden">
            @for (d of DAY_NAMES; track d) {
              <div class="bg-slate-50 text-center text-xs font-semibold text-slate-500 uppercase py-2">{{ d }}</div>
            }
            @for (day of calendarDays(); track day.date) {
              <div class="calendar-cell"
                [class.other-month]="!day.isCurrentMonth"
                [class.today]="day.isToday"
                (click)="selectDay(day)">
                <span class="text-sm font-medium">{{ day.day }}</span>
                <div class="mt-1 space-y-0.5">
                  @for (cls of day.classes; track cls.id) {
                    <span class="calendar-class"
                      [style.background]="cls.color || '#4F46E5'"
                      [style.color]="classTextColor(cls.color)">
                      {{ cls.name }}
                    </span>
                  }
                </div>
              </div>
            }
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page { padding: 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h1 { margin: 0; font-size: 22px; color: var(--color-text-primary); }
    .calendar-cell {
      background: white;
      min-height: 90px;
      padding: 6px;
      cursor: pointer;
      transition: background 0.15s;
    }
    .calendar-cell:hover { background: var(--color-primary-light); }
    .calendar-cell.other-month { opacity: 0.45; }
    .calendar-cell.today { background: var(--color-primary-light); }
    .calendar-class {
      display: block;
      font-size: 11px;
      padding: 2px 4px;
      border-radius: 3px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `],
})
export class BookingCalendarComponent implements OnInit {
  readonly DAY_NAMES = DAY_NAMES;
  private readonly classService = inject(ClassService);
  private readonly router = inject(Router);

  classTextColor(bg?: string): string {
    if (!bg) return 'white';
    const hex = bg.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.55 ? '#1E293B' : 'white';
  }

  readonly monthYear = signal('');
  readonly calendarDays = signal<CalendarDay[]>([]);

  private currentDate = new Date();
  private classes: GymClass[] = [];

  ngOnInit(): void {
    this.loadClasses();
  }

  private loadClasses(): void {
    this.classService.findAll().subscribe({
      next: (res) => {
        this.classes = res.data;
        this.buildCalendar();
      },
    });
  }

  private buildCalendar(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    this.monthYear.set(new Date(year, month).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }));

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrev = new Date(year, month, 0).getDate();
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);

    const days: CalendarDay[] = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      const d = daysInPrev - i;
      days.push(this.makeDay(year, month - 1, d, false, todayStr));
    }

    for (let d = 1; d <= daysInMonth; d++) {
      days.push(this.makeDay(year, month, d, true, todayStr));
    }

    while (days.length % 7 !== 0) {
      const d = days.length - daysInMonth - firstDay + 1;
      days.push(this.makeDay(year, month + 1, d, false, todayStr));
    }

    this.calendarDays.set(days);
  }

  private makeDay(year: number, month: number, day: number, isCurrentMonth: boolean, todayStr: string): CalendarDay {
    const date = new Date(year, month, day);
    const dateStr = date.toISOString().slice(0, 10);
    const dayOfWeek = date.getDay();

    const dayClasses = this.classes.filter((c) =>
      c.isActive && c.schedules?.some((s) => s.dayOfWeek === dayOfWeek),
    );

    return {
      date: dateStr,
      day,
      isCurrentMonth,
      isToday: dateStr === todayStr,
      classes: dayClasses.map((c) => ({ id: c.id, name: c.name, color: c.color })),
    };
  }

  prevMonth(): void {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.buildCalendar();
  }

  nextMonth(): void {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.buildCalendar();
  }

  selectDay(day: CalendarDay): void {
    this.router.navigate(['/bookings/new'], {
      queryParams: { date: day.date, classId: day.classes.length === 1 ? day.classes[0].id : undefined },
    });
  }

  newBooking(): void {
    this.router.navigate(['/bookings/new']);
  }
}

interface CalendarDay {
  date: string;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  classes: { id: string; name: string; color?: string }[];
}
