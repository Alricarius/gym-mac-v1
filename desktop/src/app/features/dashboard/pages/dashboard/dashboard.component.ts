import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="dashboard">
      <h1>Dashboard</h1>
      <div class="placeholder">
        <p>Bienvenido al sistema de gestión del gimnasio.</p>
        <p class="hint">Las métricas y reportes estarán disponibles en próximas iteraciones.</p>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      padding: 32px;
    }

    h1 {
      margin: 0 0 24px;
      font-size: 24px;
      color: #1a1a2e;
    }

    .placeholder {
      background: white;
      border-radius: 12px;
      padding: 40px;
      text-align: center;
      color: #666;
    }

    .hint {
      font-size: 13px;
      color: #999;
      margin-top: 8px;
    }
  `],
})
export class DashboardComponent {}
