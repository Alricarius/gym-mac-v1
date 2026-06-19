import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { ReportService, DashboardData } from '../../../reports/services/report.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    DatePipe, DecimalPipe, NgClass,
    MatCardModule, MatIconModule, MatDividerModule, MatButtonModule,
  ],
  template: `
    <div class="p-8">
      <h1 class="text-2xl font-medium text-gray-800 mb-6">Dashboard</h1>

      @if (loading()) {
        <div class="flex items-center justify-center py-20 text-gray-400">
          <div class="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3"></div>
          Cargando datos...
        </div>
      } @else if (error()) {
        <mat-card class="!rounded-xl !shadow-sm !border !border-red-200">
          <mat-card-content class="p-6 text-center">
            <mat-icon class="text-red-400 text-4xl mb-3">error_outline</mat-icon>
            <p class="text-gray-700 mb-2">No se pudieron cargar los datos del dashboard</p>
            <p class="text-sm text-gray-400 mb-4">{{ error() }}</p>
            <button mat-stroked-button color="primary" (click)="loadDashboard()">
              <mat-icon>refresh</mat-icon>
              Reintentar
            </button>
          </mat-card-content>
        </mat-card>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <mat-card class="!rounded-xl !shadow-sm">
            <mat-card-content class="p-5 flex items-center gap-4">
              <div class="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <mat-icon class="text-green-600">payments</mat-icon>
              </div>
              <div>
                <p class="text-sm text-gray-500">Ingresos hoy</p>
                <p class="text-2xl font-bold text-gray-800">{{ '$' + (dashboard()!.todayIncome | number:'1.2-2') }}</p>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="!rounded-xl !shadow-sm">
            <mat-card-content class="p-5 flex items-center gap-4">
              <div class="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <mat-icon class="text-blue-600">people</mat-icon>
              </div>
              <div>
                <p class="text-sm text-gray-500">Miembros activos</p>
                <p class="text-2xl font-bold text-gray-800">{{ dashboard()!.activeMembers }}</p>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="!rounded-xl !shadow-sm">
            <mat-card-content class="p-5 flex items-center gap-4">
              <div class="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <mat-icon class="text-purple-600">login</mat-icon>
              </div>
              <div>
                <p class="text-sm text-gray-500">Check-ins hoy</p>
                <p class="text-2xl font-bold text-gray-800">{{ dashboard()!.todayCheckIns }}</p>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="!rounded-xl !shadow-sm">
            <mat-card-content class="p-5 flex items-center gap-4">
              <div class="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <mat-icon class="text-orange-600">assignment</mat-icon>
              </div>
              <div>
                <p class="text-sm text-gray-500">Suscripciones activas</p>
                <p class="text-2xl font-bold text-gray-800">{{ dashboard()!.activeSubscriptions }}</p>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <mat-card class="lg:col-span-2 !rounded-xl !shadow-sm">
            <mat-card-header class="pb-0">
              <mat-card-title class="text-lg font-medium">Ingresos últimos 7 días</mat-card-title>
            </mat-card-header>
            <mat-card-content class="p-5">
              @if (dashboard()!.incomeLast7Days.length) {
                <div class="flex items-end gap-3 h-48 pt-4">
                  @for (day of dashboard()!.incomeLast7Days; track day.date) {
                    <div class="flex-1 flex flex-col items-center gap-2">
                      @let barHeight = maxIncome > 0 ? (day.total / maxIncome) * 100 : 0;
                      <div class="w-full bg-blue-500 rounded-t-md transition-all duration-300"
                           [style.height.%]="barHeight > 0 ? barHeight : 2"
                           [style.min-height.px]="barHeight > 0 ? 0 : 4">
                      </div>
                      <span class="text-xs text-gray-500">{{ day.date | date:'dd/MM' }}</span>
                    </div>
                  }
                </div>
              } @else {
                <p class="text-gray-400 text-center py-8">No hay ingresos registrados en los últimos 7 días</p>
              }
            </mat-card-content>
          </mat-card>

          <mat-card class="!rounded-xl !shadow-sm">
            <mat-card-header class="pb-0">
              <mat-card-title class="text-lg font-medium">Resumen</mat-card-title>
            </mat-card-header>
            <mat-card-content class="p-5">
              <div class="space-y-4">
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">Total miembros</span>
                  <span class="font-semibold text-lg">{{ dashboard()!.totalMembers }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">Miembros activos</span>
                  <span class="font-semibold text-lg">{{ dashboard()!.activeMembers }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">Suscripciones activas</span>
                  <span class="font-semibold text-lg">{{ dashboard()!.activeSubscriptions }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">Check-ins hoy</span>
                  <span class="font-semibold text-lg">{{ dashboard()!.todayCheckIns }}</span>
                </div>
                <mat-divider></mat-divider>
                <div class="flex justify-between items-center">
                  <span class="text-gray-600 font-medium">Ingresos hoy</span>
                  <span class="font-semibold text-lg text-green-600">{{ '$' + (dashboard()!.todayIncome | number:'1.2-2') }}</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      }
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private readonly reportService = inject(ReportService);

  readonly dashboard = signal<DashboardData | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading.set(true);
    this.error.set('');
    this.dashboard.set(null);

    this.reportService.getDashboard().subscribe({
      next: (data) => {
        this.dashboard.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Dashboard error:', err);
        this.error.set(err.status ? `Error ${err.status} — ${err.statusText}` : err.message || 'Error de conexión con el servidor');
        this.loading.set(false);
      },
    });
  }

  get maxIncome(): number {
    const data = this.dashboard();
    if (!data?.incomeLast7Days?.length) return 0;
    return Math.max(...data.incomeLast7Days.map((d) => d.total), 1);
  }
}
