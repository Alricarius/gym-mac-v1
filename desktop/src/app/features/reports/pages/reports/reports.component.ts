import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReportService, IncomeReport } from '../../services/report.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    DatePipe, DecimalPipe, FormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatDatepickerModule, MatNativeDateModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
  ],
  providers: [DatePipe],
  template: `
    <div class="p-8">
      <h1 class="text-2xl font-medium text-gray-800 mb-6">Reporte de Ingresos</h1>

      @if (errorMessage) {
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <mat-icon class="text-red-500 text-base">error</mat-icon>
          {{ errorMessage }}
        </div>
      }

      <mat-card class="!rounded-xl !shadow-sm mb-6">
        <mat-card-content class="p-5">
          <div class="flex items-end gap-4 flex-wrap">
            <mat-form-field appearance="outline" class="w-48">
              <mat-label>Desde</mat-label>
              <input matInput [matDatepicker]="fromPicker" [(ngModel)]="fromDate">
              <mat-datepicker-toggle matIconSuffix [for]="fromPicker"></mat-datepicker-toggle>
              <mat-datepicker #fromPicker></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-48">
              <mat-label>Hasta</mat-label>
              <input matInput [matDatepicker]="toPicker" [(ngModel)]="toDate">
              <mat-datepicker-toggle matIconSuffix [for]="toPicker"></mat-datepicker-toggle>
              <mat-datepicker #toPicker></mat-datepicker>
            </mat-form-field>

            <button mat-raised-button color="primary" (click)="loadReport()"
                    [disabled]="!fromDate || !toDate">
              <mat-icon>search</mat-icon>
              Consultar
            </button>

            @if (report) {
              <button mat-stroked-button color="primary" (click)="exportCsv()">
                <mat-icon>download</mat-icon>
                Exportar CSV
              </button>
            }
          </div>
        </mat-card-content>
      </mat-card>

      @if (isLoading) {
        <div class="flex justify-center items-center py-12">
          <mat-spinner diameter="40"></mat-spinner>
          <span class="ml-3 text-gray-500">Cargando...</span>
        </div>
      }

      @if (report) {
        <mat-card class="!rounded-xl !shadow-sm">
          <mat-card-content class="p-5">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-lg font-medium">Resultados</h2>
              <p class="text-lg font-bold text-green-600">
                Total: {{ '$' + (report.total | number:'1.2-2') }}
              </p>
            </div>

            @if (report.data.length) {
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead>
                    <tr class="border-b text-sm text-gray-500">
                      <th class="text-left py-3 px-2">Fecha</th>
                      <th class="text-right py-3 px-2">Transacciones</th>
                      <th class="text-right py-3 px-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (row of report.data; track row.date) {
                      <tr class="border-b last:border-b-0 hover:bg-gray-50">
                        <td class="py-3 px-2">{{ row.date | date:'fullDate' }}</td>
                        <td class="text-right py-3 px-2">{{ row.count }}</td>
                        <td class="text-right py-3 px-2 font-medium">{{ '$' + (row.total | number:'1.2-2') }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            } @else {
              <p class="text-gray-400 text-center py-8">No se encontraron ingresos en este período</p>
            }
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
})
export class ReportsComponent implements OnInit {
  private readonly reportService = inject(ReportService);
  private readonly datePipe = inject(DatePipe);

  fromDate: Date | null = null;
  toDate: Date | null = null;
  report: IncomeReport | null = null;
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    const now = new Date();
    this.fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
    this.toDate = now;
    this.loadReport();
  }

  loadReport(): void {
    if (!this.fromDate || !this.toDate) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.report = null;

    const from = this.toDateStr(this.fromDate);
    const to = this.toDateStr(this.toDate);

    this.reportService.getIncome(from, to).subscribe({
      next: (data) => {
        this.report = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading report:', err);
        this.errorMessage = 'Error al cargar el reporte. Verifica la conexión con el servidor.';
        this.isLoading = false;
      },
    });
  }

  exportCsv(): void {
    if (!this.report?.data.length) return;

    const headers = 'Fecha,Transacciones,Total\n';
    const rows = this.report.data
      .map((r) => {
        const date = this.datePipe.transform(r.date, 'yyyy-MM-dd') ?? r.date;
        return `${date},${r.count},${r.total}`;
      })
      .join('\n');
    const csv = headers + rows;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ingresos_${this.report.from}_${this.report.to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private toDateStr(date: Date): string {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }
}
