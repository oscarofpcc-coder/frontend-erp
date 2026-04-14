import { Component, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables, ChartConfiguration, ChartData } from 'chart.js';

Chart.register(...registerables);

interface StatCard {
  title: string;
  value: string;
  icon: string;
  color: string;
}

interface MonitorVentasRow {
  Sucursal: string;
  Usuario: string;
  Importe: number;
  Dscto: number;
  Iva: number;
  Total: number;
  USDRentabilidad: number;
  OrdenesTrabajo: number;
  Facturas: number;
  Notas: number;
  USDFacturas: number;
  USDNotasOrd: number;
  Prioridad: number;
}

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    BaseChartDirective,
    DecimalPipe,
  ],
  template: `
    <h2 class="page-title">Dashboard</h2>
    <p class="page-subtitle">Bienvenido al panel de control</p>

    <div class="stats-grid">
      @for (card of statCards(); track card.title) {
        <mat-card class="stat-card" [style.border-left-color]="card.color">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-info">
                <span class="stat-title">{{ card.title }}</span>
                <span class="stat-value">{{ card.value }}</span>
              </div>
              <div class="stat-icon" [style.background]="card.color + '20'" [style.color]="card.color">
                <mat-icon>{{ card.icon }}</mat-icon>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      }
    </div>

    <!-- Filters Section -->
    <mat-card class="filters-card">
      <mat-card-content>
        <h3 class="section-title">
          <mat-icon>filter_list</mat-icon>
          Monitor de Ventas
        </h3>
        <div class="filters-row">
          <mat-form-field appearance="outline">
            <mat-label>Fecha Desde</mat-label>
            <input matInput type="date" [(ngModel)]="fecDesde">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Fecha Hasta</mat-label>
            <input matInput type="date" [(ngModel)]="fecHasta">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Usuario</mat-label>
            <mat-select [(ngModel)]="selectedUsuario">
              <mat-option value="">Todos</mat-option>
              @for (u of usuarios(); track u) {
                <mat-option [value]="u">{{ u }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Sucursal</mat-label>
            <mat-select [(ngModel)]="selectedSucursal">
              <mat-option value="">Todas</mat-option>
              @for (s of sucursales(); track s) {
                <mat-option [value]="s">{{ s }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <button mat-raised-button color="primary" (click)="loadMonitorVentas()" [disabled]="isLoadingVentas()">
            <mat-icon>search</mat-icon>
            Consultar
          </button>
        </div>
      </mat-card-content>
    </mat-card>

    @if (isLoadingVentas()) {
      <div class="loading-container">
        <mat-spinner diameter="40"></mat-spinner>
      </div>
    }

    @if (ventasData().length > 0) {
      <!-- Chart: Ventas por Sucursal -->
      <div class="charts-grid">
        <mat-card class="chart-card">
          <mat-card-content>
            <h3 class="chart-title">
              <mat-icon>store</mat-icon>
              Ventas por Sucursal
            </h3>
            <div class="chart-container">
              <canvas baseChart
                [data]="chartSucursalData()"
                [options]="barChartOptions"
                type="bar">
              </canvas>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Chart: Ventas por Usuario -->
        <mat-card class="chart-card">
          <mat-card-content>
            <h3 class="chart-title">
              <mat-icon>people</mat-icon>
              Comparativo de Ventas por Usuario
            </h3>
            <div class="chart-container">
              <canvas baseChart
                [data]="chartUsuarioData()"
                [options]="barChartOptionsUsuario"
                type="bar">
              </canvas>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Chart: Total vs Rentabilidad por Sucursal -->
      <div class="charts-grid">
        <mat-card class="chart-card">
          <mat-card-content>
            <h3 class="chart-title">
              <mat-icon>account_balance</mat-icon>
              Total vs Rentabilidad por Sucursal
            </h3>
            <div class="chart-container">
              <canvas baseChart
                [data]="chartRentabilidadData()"
                [options]="barChartOptions"
                type="bar">
              </canvas>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Chart: Total vs Presupuesto por Usuario -->
        <mat-card class="chart-card">
          <mat-card-content>
            <h3 class="chart-title">
              <mat-icon>savings</mat-icon>
              Total vs Presupuesto ($1,000) por Usuario
            </h3>
            <div class="chart-container">
              <canvas baseChart
                [data]="chartPresupuestoData()"
                [options]="barChartOptionsPresupuesto"
                type="bar">
              </canvas>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Data Table -->
      <mat-card class="table-card">
        <mat-card-content>
          <h3 class="chart-title">
            <mat-icon>table_chart</mat-icon>
            Detalle de Ventas
          </h3>
          <div class="table-container">
            <table mat-table [dataSource]="ventasData()" class="ventas-table">
              <ng-container matColumnDef="Sucursal">
                <th mat-header-cell *matHeaderCellDef>Sucursal</th>
                <td mat-cell *matCellDef="let row">{{ row.Sucursal }}</td>
              </ng-container>
              <ng-container matColumnDef="Usuario">
                <th mat-header-cell *matHeaderCellDef>Usuario</th>
                <td mat-cell *matCellDef="let row">{{ row.Usuario }}</td>
              </ng-container>
              <ng-container matColumnDef="Importe">
                <th mat-header-cell *matHeaderCellDef>Importe</th>
                <td mat-cell *matCellDef="let row" class="text-right">{{ row.Importe | number:'1.2-2' }}</td>
              </ng-container>
              <ng-container matColumnDef="Dscto">
                <th mat-header-cell *matHeaderCellDef>Dscto</th>
                <td mat-cell *matCellDef="let row" class="text-right">{{ row.Dscto | number:'1.2-2' }}</td>
              </ng-container>
              <ng-container matColumnDef="Iva">
                <th mat-header-cell *matHeaderCellDef>IVA</th>
                <td mat-cell *matCellDef="let row" class="text-right">{{ row.Iva | number:'1.2-2' }}</td>
              </ng-container>
              <ng-container matColumnDef="Total">
                <th mat-header-cell *matHeaderCellDef>Total</th>
                <td mat-cell *matCellDef="let row" class="text-right total-col">{{ row.Total | number:'1.2-2' }}</td>
              </ng-container>
              <ng-container matColumnDef="Facturas">
                <th mat-header-cell *matHeaderCellDef>Facturas</th>
                <td mat-cell *matCellDef="let row" class="text-center">{{ row.Facturas }}</td>
              </ng-container>
              <ng-container matColumnDef="OrdenesTrabajo">
                <th mat-header-cell *matHeaderCellDef>Órdenes</th>
                <td mat-cell *matCellDef="let row" class="text-center">{{ row.OrdenesTrabajo }}</td>
              </ng-container>
              <ng-container matColumnDef="Notas">
                <th mat-header-cell *matHeaderCellDef>Notas</th>
                <td mat-cell *matCellDef="let row" class="text-center">{{ row.Notas }}</td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </div>
        </mat-card-content>
      </mat-card>
    }
  `,
  styles: [`
    .page-title {
      font-size: 28px;
      font-weight: 600;
      color: #1a237e;
      margin: 0 0 4px 0;
    }

    .page-subtitle {
      color: #666;
      margin: 0 0 24px 0;
      font-size: 14px;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 48px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card {
      border-left: 4px solid;
      border-radius: 12px !important;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12) !important;
    }

    .stat-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
    }

    .stat-info {
      display: flex;
      flex-direction: column;
    }

    .stat-title {
      font-size: 14px;
      color: #666;
      margin-bottom: 4px;
    }

    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: #333;
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .filters-card {
      margin-bottom: 24px;
      border-radius: 12px !important;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
      font-weight: 600;
      color: #1a237e;
      margin: 0 0 16px 0;
    }

    .filters-row {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: center;
    }

    .filters-row mat-form-field {
      flex: 1;
      min-width: 160px;
    }

    .filters-row button {
      height: 56px;
      min-width: 130px;
    }

    .charts-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 24px;
      margin-bottom: 24px;
    }

    .chart-card {
      border-radius: 12px !important;
    }

    .chart-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 600;
      color: #1a237e;
      margin: 0 0 16px 0;
    }

    .chart-container {
      position: relative;
      height: 350px;
    }

    .table-card {
      border-radius: 12px !important;
      margin-bottom: 24px;
    }

    .table-container {
      overflow-x: auto;
    }

    .ventas-table {
      width: 100%;
    }

    .text-right {
      text-align: right !important;
    }

    .text-center {
      text-align: center !important;
    }

    .total-col {
      font-weight: 700;
      color: #1a237e;
    }

    @media (min-width: 600px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (min-width: 960px) {
      .stats-grid {
        grid-template-columns: repeat(3, 1fr);
      }
      .charts-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `],
})
export class DashboardComponent implements OnInit {
  readonly isLoadingVentas = signal(false);
  readonly ventasData = signal<MonitorVentasRow[]>([]);
  readonly sucursales = signal<string[]>([]);
  readonly usuarios = signal<string[]>([]);

  readonly statCards = computed<StatCard[]>(() => {
    const data = this.ventasData();
    const totalVentas = data.reduce((sum, r) => sum + (r.Total || 0), 0);
    const totalFacturas = data.reduce((sum, r) => sum + (r.Facturas || 0), 0);
    const totalOrdenes = data.reduce((sum, r) => sum + (r.OrdenesTrabajo || 0), 0);
    const totalNotas = data.reduce((sum, r) => sum + (r.Notas || 0), 0);
    const usuariosUnicos = new Set(data.map((r) => r.Usuario)).size;
    const sucursalesUnicas = new Set(data.map((r) => r.Sucursal)).size;

    return [
      {
        title: 'Total Ventas',
        value: `$${totalVentas.toLocaleString('es-EC', { minimumFractionDigits: 2 })}`,
        icon: 'trending_up',
        color: '#4caf50',
      },
      {
        title: 'Facturas',
        value: totalFacturas.toString(),
        icon: 'receipt_long',
        color: '#2196f3',
      },
      {
        title: 'Órdenes de Trabajo',
        value: totalOrdenes.toString(),
        icon: 'assignment',
        color: '#ff9800',
      },
      {
        title: 'Notas de Venta',
        value: totalNotas.toString(),
        icon: 'description',
        color: '#9c27b0',
      },
      {
        title: 'Usuarios Activos',
        value: usuariosUnicos.toString(),
        icon: 'people',
        color: '#00bcd4',
      },
      {
        title: 'Sucursales',
        value: sucursalesUnicas.toString(),
        icon: 'store',
        color: '#f44336',
      },
    ];
  });

  fecDesde = this.formatDate(new Date(new Date().getFullYear(), 0, 1));
  fecHasta = this.formatDate(new Date());
  selectedUsuario = '';
  selectedSucursal = '';

  displayedColumns = ['Sucursal', 'Usuario', 'Importe', 'Dscto', 'Iva', 'Total', 'Facturas', 'OrdenesTrabajo', 'Notas'];

  readonly barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: $${(ctx.raw as number).toLocaleString('es-EC', { minimumFractionDigits: 2 })}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => '$' + Number(value).toLocaleString('es-EC'),
        },
      },
    },
  };

  readonly barChartOptionsUsuario: ChartConfiguration<'bar'>['options'] = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: $${(ctx.raw as number).toLocaleString('es-EC', { minimumFractionDigits: 2 })}`,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          callback: (value) => '$' + Number(value).toLocaleString('es-EC'),
        },
      },
    },
  };

  readonly chartSucursalData = computed<ChartData<'bar'>>(() => {
    const data = this.ventasData();
    const sucursalMap = new Map<string, { total: number; importe: number; iva: number }>();

    for (const row of data) {
      const key = row.Sucursal || 'Sin Sucursal';
      const current = sucursalMap.get(key) || { total: 0, importe: 0, iva: 0 };
      current.total += row.Total || 0;
      current.importe += row.Importe || 0;
      current.iva += row.Iva || 0;
      sucursalMap.set(key, current);
    }

    const labels = Array.from(sucursalMap.keys());
    return {
      labels,
      datasets: [
        {
          label: 'Total',
          data: labels.map((l) => sucursalMap.get(l)!.total),
          backgroundColor: '#1a237e',
          borderRadius: 6,
        },
        {
          label: 'Importe',
          data: labels.map((l) => sucursalMap.get(l)!.importe),
          backgroundColor: '#42a5f5',
          borderRadius: 6,
        },
        {
          label: 'IVA',
          data: labels.map((l) => sucursalMap.get(l)!.iva),
          backgroundColor: '#ef5350',
          borderRadius: 6,
        },
      ],
    };
  });

  readonly chartRentabilidadData = computed<ChartData<'bar'>>(() => {
    const data = this.ventasData();
    const sucMap = new Map<string, { total: number; rentabilidad: number }>();

    for (const row of data) {
      const key = row.Sucursal || 'Sin Sucursal';
      const cur = sucMap.get(key) || { total: 0, rentabilidad: 0 };
      cur.total += row.Total || 0;
      cur.rentabilidad += row.USDRentabilidad || 0;
      sucMap.set(key, cur);
    }

    const labels = Array.from(sucMap.keys());
    return {
      labels,
      datasets: [
        {
          label: 'Total Ventas',
          data: labels.map((l) => sucMap.get(l)!.total),
          backgroundColor: '#1a237e',
          borderRadius: 6,
        },
        {
          label: 'Rentabilidad (USD)',
          data: labels.map((l) => sucMap.get(l)!.rentabilidad),
          backgroundColor: '#4caf50',
          borderRadius: 6,
        },
      ],
    };
  });

  readonly chartPresupuestoData = computed<ChartData<'bar'>>(() => {
    const data = this.ventasData();
    const presupuesto = 1000;
    const userMap = new Map<string, number>();

    for (const row of data) {
      const key = row.Usuario || 'Sin Usuario';
      userMap.set(key, (userMap.get(key) || 0) + (row.Total || 0));
    }

    const sorted = Array.from(userMap.entries()).sort((a, b) => b[1] - a[1]);
    const labels = sorted.map(([name]) => name);
    const totals = sorted.map(([, total]) => total);

    return {
      labels,
      datasets: [
        {
          label: 'Total Ventas',
          data: totals,
          backgroundColor: totals.map((v) => v >= presupuesto ? '#4caf50' : '#f44336'),
          borderRadius: 6,
        },
        {
          label: 'Presupuesto ($1,000)',
          data: labels.map(() => presupuesto),
          backgroundColor: '#ff9800',
          borderRadius: 6,
        },
      ],
    };
  });

  readonly barChartOptionsPresupuesto: ChartConfiguration<'bar'>['options'] = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: $${(ctx.raw as number).toLocaleString('es-EC', { minimumFractionDigits: 2 })}`,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          callback: (value) => '$' + Number(value).toLocaleString('es-EC'),
        },
      },
    },
  };

  readonly chartUsuarioData = computed<ChartData<'bar'>>(() => {
    const data = this.ventasData();
    const userMap = new Map<string, number>();

    for (const row of data) {
      const key = row.Usuario || 'Sin Usuario';
      userMap.set(key, (userMap.get(key) || 0) + (row.Total || 0));
    }

    const sorted = Array.from(userMap.entries()).sort((a, b) => b[1] - a[1]);
    const labels = sorted.map(([name]) => name);
    const values = sorted.map(([, total]) => total);

    return {
      labels,
      datasets: [
        {
          label: 'Total Ventas',
          data: values,
          backgroundColor: this.generateColors(labels.length),
          borderRadius: 6,
        },
      ],
    };
  });

  private readonly apiUrl = 'http://localhost:3000/api';

  constructor(private readonly http: HttpClient) {}

  ngOnInit(): void {
    this.loadFilters();
    this.loadMonitorVentas();
  }

  loadMonitorVentas(): void {
    this.isLoadingVentas.set(true);

    let params = new HttpParams()
      .set('fecDesde', this.fecDesde)
      .set('fecHasta', this.fecHasta);

    if (this.selectedUsuario) {
      params = params.set('usuario', this.selectedUsuario);
    }
    if (this.selectedSucursal) {
      params = params.set('sucursal', this.selectedSucursal);
    }

    this.http
      .get<MonitorVentasRow[]>(`${this.apiUrl}/dashboard/monitor-ventas`, { params })
      .subscribe({
        next: (data) => {
          this.ventasData.set(data);
          this.isLoadingVentas.set(false);
        },
        error: () => {
          this.ventasData.set([]);
          this.isLoadingVentas.set(false);
        },
      });
  }

  private loadFilters(): void {
    this.http.get<string[]>(`${this.apiUrl}/dashboard/sucursales`).subscribe({
      next: (data) => this.sucursales.set(data),
      error: () => this.sucursales.set([]),
    });

    this.http.get<string[]>(`${this.apiUrl}/dashboard/usuarios-ventas`).subscribe({
      next: (data) => this.usuarios.set(data),
      error: () => this.usuarios.set([]),
    });
  }

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private generateColors(count: number): string[] {
    const palette = [
      '#1a237e', '#283593', '#303f9f', '#3949ab', '#3f51b5',
      '#5c6bc0', '#7986cb', '#9fa8da', '#c5cae9', '#e8eaf6',
      '#0d47a1', '#1565c0', '#1976d2', '#1e88e5', '#2196f3',
      '#42a5f5', '#64b5f6', '#90caf9', '#bbdefb', '#e3f2fd',
    ];
    return Array.from({ length: count }, (_, i) => palette[i % palette.length]);
  }
}
