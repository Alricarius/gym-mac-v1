import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { BookingService, Booking } from '../../services/booking.service';
import { ClassService, GymClass } from '../../../classes/services/class.service';

const STATUS_LABELS: Record<string, string> = {
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  waitlisted: 'En espera',
  attended: 'Asistió',
  no_show: 'Ausente',
};

@Component({
  selector: 'app-booking-list',
  standalone: true,
  imports: [
    DatePipe, FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule,
    MatIconModule, MatPaginatorModule, MatCardModule, MatSelectModule,
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Listado de reservas</h1>
        <button mat-raised-button color="primary" (click)="newBooking()">
          <mat-icon>add</mat-icon>
          Nueva reserva
        </button>
      </div>

      <mat-card class="!rounded-xl !shadow-sm">
        <mat-card-content class="!p-6">
          <div class="flex gap-4 flex-wrap mb-4">
            <mat-form-field appearance="outline" class="!w-48">
              <mat-label>Clase</mat-label>
              <mat-select [(ngModel)]="filterClassId" (selectionChange)="applyFilters()">
                <mat-option value="">Todas</mat-option>
                @for (c of classes(); track c.id) {
                  <mat-option [value]="c.id">{{ c.name }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline" class="!w-48">
              <mat-label>Fecha</mat-label>
              <input matInput type="date" [(ngModel)]="filterDate" (change)="applyFilters()" />
            </mat-form-field>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-slate-200">
                  <th class="text-left font-semibold text-slate-500 uppercase text-xs tracking-wider py-3 px-4">Miembro</th>
                  <th class="text-left font-semibold text-slate-500 uppercase text-xs tracking-wider py-3 px-4">Clase</th>
                  <th class="text-left font-semibold text-slate-500 uppercase text-xs tracking-wider py-3 px-4">Fecha</th>
                  <th class="text-left font-semibold text-slate-500 uppercase text-xs tracking-wider py-3 px-4">Horario</th>
                  <th class="text-left font-semibold text-slate-500 uppercase text-xs tracking-wider py-3 px-4">Estado</th>
                  <th class="text-left font-semibold text-slate-500 uppercase text-xs tracking-wider py-3 px-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (b of bookings(); track b.id) {
                  <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td class="py-3 px-4 font-medium text-slate-800">{{ b.member?.fullName || '—' }}</td>
                    <td class="py-3 px-4 text-slate-500">{{ b.gymClass?.name || '—' }}</td>
                    <td class="py-3 px-4 text-slate-500">{{ b.bookingDate | date: 'dd/MM/yyyy' }}</td>
                    <td class="py-3 px-4 text-slate-500">
                      @if (b.schedule) {
                        {{ b.schedule.startTime.slice(0,5) }} - {{ b.schedule.endTime.slice(0,5) }}
                      } @else { — }
                    </td>
                    <td class="py-3 px-4">
                      <span class="badge badge-{{ b.status }}">{{ STATUS_LABELS[b.status] || b.status }}</span>
                    </td>
                    <td class="py-3 px-4">
                      @if (b.status === 'confirmed') {
                        <button mat-stroked-button class="!mr-1 !text-xs" (click)="cancelBooking(b)">Cancelar</button>
                        <button mat-stroked-button class="!mr-1 !text-xs" (click)="markAttended(b)">Asistió</button>
                      }
                      @if (b.status === 'waitlisted') {
                        <button mat-stroked-button color="warn" class="!text-xs" (click)="cancelBooking(b)">Cancelar</button>
                      }
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6" class="empty">No hay reservas</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          @if (totalPages() > 1) {
            <mat-paginator class="!mt-4"
              [length]="total()"
              [pageSize]="20"
              [pageIndex]="page() - 1"
              [pageSizeOptions]="[10, 20, 50]"
              (page)="onPageChange($event)"
              showFirstLastButtons>
            </mat-paginator>
          }

          @if (loading()) {
            <div class="loading">Cargando...</div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class BookingListComponent implements OnInit {
  readonly STATUS_LABELS = STATUS_LABELS;
  private readonly dialog = inject(MatDialog);
  private readonly bookingService = inject(BookingService);
  private readonly classService = inject(ClassService);
  private readonly router = inject(Router);

  readonly bookings = signal<Booking[]>([]);
  readonly classes = signal<GymClass[]>([]);
  readonly loading = signal(false);
  readonly page = signal(1);
  readonly total = signal(0);
  readonly totalPages = signal(1);

  filterClassId = '';
  filterDate = '';

  ngOnInit(): void {
    this.loadClasses();
    this.loadBookings();
  }

  private loadClasses(): void {
    this.classService.findAll().subscribe({
      next: (res) => this.classes.set(res.data),
    });
  }

  loadBookings(): void {
    this.loading.set(true);
    this.bookingService.findAll(
      this.filterClassId || undefined,
      undefined,
      this.filterDate || undefined,
      this.page(),
    ).subscribe({
      next: (res) => {
        this.bookings.set(res.data);
        this.total.set(res.meta.total);
        this.totalPages.set(res.meta.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  applyFilters(): void { this.page.set(1); this.loadBookings(); }
  onPageChange(e: PageEvent): void { this.page.set(e.pageIndex + 1); this.loadBookings(); }

  newBooking(): void {
    this.router.navigate(['/bookings/new']);
  }

  cancelBooking(b: Booking): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Cancelar reserva', message: '¿Cancelar esta reserva?' },
    });
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) this.bookingService.updateStatus(b.id, { status: 'cancelled' }).subscribe(() => this.loadBookings());
    });
  }

  markAttended(b: Booking): void {
    this.bookingService.updateStatus(b.id, { status: 'attended' }).subscribe(() => this.loadBookings());
  }
}
