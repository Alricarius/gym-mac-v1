import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import {
  InventoryItemService, InventoryItem, InventoryLoan,
} from '../../services/inventory-item.service';
import { BranchStore } from '../../../../core/services/branch-store.service';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [
    FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule,
    MatIconModule, MatPaginatorModule, MatCardModule, MatSelectModule,
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Inventario</h1>
        <button mat-raised-button color="primary" (click)="create()">
          <mat-icon>add</mat-icon>
          Nuevo equipo
        </button>
      </div>

      <mat-card class="!rounded-xl !shadow-sm">
        <mat-card-content class="!p-6">
          <div class="flex gap-4 mb-4 items-end">
            <mat-form-field appearance="outline" class="max-w-sm flex-1">
              <mat-label>Buscar por nombre</mat-label>
              <input matInput [(ngModel)]="searchTerm" (input)="onSearch()" placeholder="Escribí un nombre..." />
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-200">
                  <th class="text-left font-semibold text-gray-500 uppercase text-xs tracking-wider py-3 px-4">Nombre</th>
                  <th class="text-left font-semibold text-gray-500 uppercase text-xs tracking-wider py-3 px-4">Descripción</th>
                  <th class="text-center font-semibold text-gray-500 uppercase text-xs tracking-wider py-3 px-4">Total</th>
                  <th class="text-center font-semibold text-gray-500 uppercase text-xs tracking-wider py-3 px-4">Disponible</th>
                  <th class="text-left font-semibold text-gray-500 uppercase text-xs tracking-wider py-3 px-4">Estado</th>
                  <th class="text-left font-semibold text-gray-500 uppercase text-xs tracking-wider py-3 px-4">Préstamos activos</th>
                  <th class="text-left font-semibold text-gray-500 uppercase text-xs tracking-wider py-3 px-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (item of items(); track item.id) {
                  <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td class="py-3 px-4 font-medium text-gray-800">{{ item.name }}</td>
                    <td class="py-3 px-4 text-gray-500 max-w-xs truncate">{{ item.description || '-' }}</td>
                    <td class="py-3 px-4 text-center text-gray-500">{{ item.totalQuantity }}</td>
                    <td class="py-3 px-4 text-center text-gray-500">{{ item.availableQuantity }}</td>
                    <td class="py-3 px-4">
                      <span class="badge badge-{{ getStockClass(item) }}">
                        {{ getStockLabel(item) }}
                      </span>
                    </td>
                    <td class="py-3 px-4">
                      @if (getItemActiveLoans(item).length > 0) {
                        <span class="text-xs text-gray-500">
                          @for (loan of getItemActiveLoans(item); track loan.id; let last = $last) {
                            {{ loan.member.fullName }}{{ last ? '' : ', ' }}
                          }
                        </span>
                      } @else {
                        <span class="text-xs text-gray-400">-</span>
                      }
                    </td>
                    <td class="py-3 px-4">
                      <button mat-stroked-button class="!mr-1 !mb-1" (click)="edit(item)">Editar</button>
                      @if (item.availableQuantity > 0) {
                        <button mat-stroked-button color="primary" class="!mr-1 !mb-1" (click)="loanItem(item)">Prestar</button>
                      }
                      @if (hasActiveLoans(item)) {
                        <button mat-stroked-button class="!mb-1" (click)="showReturnOptions(item)">Devolver</button>
                      }
                    </td>
                  </tr>
                  @if (returnItemId() === item.id) {
                    <tr class="bg-gray-50">
                      <td colspan="7" class="py-3 px-4">
                        <div class="flex items-center gap-3">
                          <span class="text-sm font-medium text-gray-600">Devolver a quién?</span>
                          <select class="border border-gray-300 rounded-lg px-3 py-2 text-sm" #returnSelect>
                            @for (loan of getItemActiveLoans(item); track loan.id) {
                              <option [value]="loan.id">
                                {{ loan.member.fullName }} ({{ loan.quantity }}x)
                              </option>
                            }
                          </select>
                          <button mat-flat-button color="primary" (click)="confirmReturn(item.id, returnSelect.value)">
                            Confirmar devolución
                          </button>
                          <button mat-stroked-button (click)="cancelReturn()">Cancelar</button>
                        </div>
                      </td>
                    </tr>
                  }
                } @empty {
                  <tr>
                    <td colspan="7" class="empty">No hay equipos en inventario</td>
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
export class InventoryListComponent implements OnInit {
  private readonly inventoryService = inject(InventoryItemService);
  private readonly branchStore = inject(BranchStore);
  private readonly router = inject(Router);

  readonly items = signal<InventoryItem[]>([]);
  readonly activeLoans = signal<Record<string, InventoryLoan[]>>({});
  readonly loading = signal(false);
  readonly page = signal(1);
  readonly total = signal(0);
  readonly totalPages = signal(1);
  readonly returnItemId = signal<string | null>(null);
  searchTerm = '';

  ngOnInit(): void {
    this.branchStore.loadBranches();
    this.loadItems();
  }

  loadItems(): void {
    this.loading.set(true);
    this.inventoryService.findAll(
      this.branchStore.selectedBranch()?.id,
      this.searchTerm || undefined,
      this.page(),
    ).subscribe({
      next: (res) => {
        this.items.set(res.data);
        this.total.set(res.meta.total);
        this.totalPages.set(res.meta.totalPages);
        this.loading.set(false);
        this.loadActiveLoans(res.data);
      },
      error: () => this.loading.set(false),
    });
  }

  loadActiveLoans(items: InventoryItem[]): void {
    for (const item of items) {
      this.inventoryService.findActiveLoans(item.id).subscribe({
        next: (loans) => {
          this.activeLoans.update((m) => ({ ...m, [item.id]: loans }));
        },
      });
    }
  }

  onSearch(): void { this.page.set(1); this.loadItems(); }

  onPageChange(e: PageEvent): void {
    this.page.set(e.pageIndex + 1);
    this.loadItems();
  }

  getStockClass(item: InventoryItem): string {
    if (item.availableQuantity === 0) return 'inactive';
    if (item.availableQuantity <= Math.ceil(item.totalQuantity * 0.25)) return 'warning';
    return 'active';
  }

  getStockLabel(item: InventoryItem): string {
    if (item.availableQuantity === 0) return 'Sin stock';
    if (item.availableQuantity <= Math.ceil(item.totalQuantity * 0.25)) return 'Poco stock';
    return 'Disponible';
  }

  create(): void { this.router.navigate(['/inventory/new']); }
  edit(item: InventoryItem): void { this.router.navigate(['/inventory', item.id]); }
  loanItem(item: InventoryItem): void { this.router.navigate(['/inventory', item.id, 'loan']); }

  getItemActiveLoans(item: InventoryItem): InventoryLoan[] {
    return this.activeLoans()[item.id] || [];
  }

  hasActiveLoans(item: InventoryItem): boolean {
    return this.getItemActiveLoans(item).length > 0;
  }

  showReturnOptions(item: InventoryItem): void {
    this.returnItemId.set(this.returnItemId() === item.id ? null : item.id);
  }

  cancelReturn(): void { this.returnItemId.set(null); }

  confirmReturn(itemId: string, loanId: string): void {
    if (!loanId) return;
    this.inventoryService.return(itemId, { loanId }).subscribe({
      next: () => {
        this.returnItemId.set(null);
        this.loadItems();
      },
    });
  }
}
