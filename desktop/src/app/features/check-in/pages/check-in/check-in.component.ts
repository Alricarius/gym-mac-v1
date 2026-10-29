import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { CheckInService, ActiveMember, VerifyResponse } from '../../services/check-in.service';
import { MemberService, Member } from '../../../members/services/member.service';
import { SocketService } from '../../../../core/services/socket.service';
import { BranchStore } from '../../../../core/services/branch-store.service';

@Component({
  selector: 'app-check-in',
  standalone: true,
  imports: [
    FormsModule, DatePipe, MatButtonModule, MatFormFieldModule, MatInputModule,
    MatIconModule, MatCardModule, MatChipsModule,
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Control de Acceso</h1>
        <div class="flex items-center gap-2">
          <mat-chip [class]="socketService.connected() ? 'chip-connected' : 'chip-disconnected'">
            {{ socketService.connected() ? 'Conectado' : 'Desconectado' }}
          </mat-chip>
        </div>
      </div>

      <div class="flex gap-6">
        <div class="flex-1">
          <mat-card class="!rounded-xl !shadow-sm">
            <mat-card-header>
              <mat-card-title class="!text-lg">Buscar socio</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <mat-form-field appearance="outline" class="w-full mt-2">
                <mat-label>Buscar por nombre</mat-label>
                <input matInput [(ngModel)]="searchTerm" (input)="onSearch()" placeholder="Escribí un nombre..." />
                <mat-icon matSuffix>search</mat-icon>
              </mat-form-field>

              @if (searchResults().length > 0) {
                <div class="flex flex-col gap-2 mt-4">
                  @for (member of searchResults(); track member.id) {
                    <div class="flex justify-between items-center p-3 border rounded-lg transition-colors"
                         [class.border-green-400]="verifiedMember()?.member?.id === member.id"
                         [class.bg-green-50]="verifiedMember()?.member?.id === member.id">
                      <div class="flex flex-col">
                        <span class="font-medium text-slate-800">{{ member.fullName }}</span>
                        @if (member.email) {
                          <span class="text-sm text-slate-500">{{ member.email }}</span>
                        }
                      </div>
                      <div class="flex gap-2">
                        @if (loadingVerify() === member.id) {
                          <mat-chip class="!bg-slate-100">Verificando...</mat-chip>
                        } @else {
                          <button mat-raised-button color="primary" (click)="doEntry(member)">
                            <mat-icon>login</mat-icon>
                            Entrada
                          </button>
                          <button mat-raised-button (click)="doExit(member)">
                            <mat-icon>logout</mat-icon>
                            Salida
                          </button>
                        }
                      </div>
                    </div>
                  }
                </div>
              }

              @if (searchTerm && searchResults().length === 0 && !searching()) {
                <p class="empty mt-4">No se encontraron socios</p>
              }

              @if (verifyError()) {
                <div class="alert alert-error">{{ verifyError() }}</div>
              }

              @if (wrongBranchMember(); as wm) {
                <div class="alert alert-warning !mt-4">
                  <p class="font-medium">{{ wm.fullName }}</p>
                  <p class="text-sm mt-1">Pertenece a <strong>{{ wm.branchName }}</strong>.</p>
                  <p class="text-sm">¿Deseas cambiar su sucursal a <strong>{{ branchStore.selectedBranch()?.name }}</strong> y registrar entrada?</p>
                  <div class="flex gap-2 mt-3">
                    <button mat-raised-button color="primary" (click)="changeBranchAndEnter()">
                      Sí, cambiar y entrar
                    </button>
                    <button mat-stroked-button (click)="wrongBranchMember.set(null)">Cancelar</button>
                  </div>
                </div>
              }
            </mat-card-content>
          </mat-card>
        </div>

        <div class="w-96">
          <mat-card class="!rounded-xl !shadow-sm !sticky !top-6">
            <mat-card-header>
              <mat-card-title class="!text-lg">Socios en el gym</mat-card-title>
              <mat-chip class="!bg-indigo-100 !text-indigo-700">{{ activeMembers().length }}</mat-chip>
            </mat-card-header>
            <mat-card-content>
              @if (activeMembers().length > 0) {
                <div class="flex flex-col gap-2 mt-2">
                  @for (item of activeMembers(); track item.id) {
                    <div class="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                      <div class="flex flex-col">
                        <span class="font-medium text-sm">{{ item.fullName }}</span>
                        <span class="text-xs text-slate-500">Desde {{ item.createdAt | date:'HH:mm' }}</span>
                      </div>
                      <mat-icon class="text-emerald-500 text-lg">circle</mat-icon>
                    </div>
                  }
                </div>
              } @else {
                <p class="empty mt-4">No hay socios en el gym</p>
              }
            </mat-card-content>
          </mat-card>

          @if (lastResponse(); as res) {
            <mat-card class="!mt-4 !rounded-xl" [class]="res.canEnter ? '!bg-green-50' : '!bg-red-50'">
              <mat-card-content class="!text-center !font-medium !py-3"
                [class]="res.canEnter ? '!text-green-700' : '!text-red-700'">
                @if (res.canEnter) {
                  <mat-icon class="align-middle mr-1">check_circle</mat-icon>
                  Acceso permitido
                } @else {
                  <mat-icon class="align-middle mr-1">cancel</mat-icon>
                  {{ res.reason }}
                }
              </mat-card-content>
            </mat-card>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chip-connected { background: var(--color-success-bg) !important; color: var(--color-success-text) !important; }
    .chip-disconnected { background: var(--color-error-bg) !important; color: var(--color-error-text) !important; }
  `],
})
export class CheckInComponent implements OnInit, OnDestroy {
  private readonly checkInService = inject(CheckInService);
  private readonly memberService = inject(MemberService);
  readonly socketService = inject(SocketService);
  readonly branchStore = inject(BranchStore);
  private wsSubscription: Subscription | null = null;

  readonly searchResults = signal<Member[]>([]);
  readonly activeMembers = signal<ActiveMember[]>([]);
  readonly searching = signal(false);
  readonly loadingVerify = signal<string | null>(null);
  readonly verifiedMember = signal<VerifyResponse | null>(null);
  readonly verifyError = signal<string | null>(null);
  readonly lastResponse = signal<VerifyResponse | null>(null);
  readonly wrongBranchMember = signal<VerifyResponse['member'] | null>(null);
  readonly pendingMember = signal<Member | null>(null);
  searchTerm = '';

  ngOnInit(): void {
    this.socketService.connect();
    this.loadActive();
    this.wsSubscription = this.socketService.onCheckInUpdate().subscribe(() => {
      this.loadActive();
    });
  }

  ngOnDestroy(): void {
    this.wsSubscription?.unsubscribe();
    this.socketService.disconnect();
  }

  onSearch(): void {
    if (!this.searchTerm || this.searchTerm.length < 2) {
      this.searchResults.set([]);
      return;
    }
    this.searching.set(true);
    this.memberService.findAll(this.searchTerm).subscribe({
      next: (res) => {
        this.searchResults.set(res.data);
        this.searching.set(false);
      },
      error: () => this.searching.set(false),
    });
  }

  doEntry(member: Member): void {
    this.loadingVerify.set(member.id);
    this.verifyError.set(null);
    this.verifiedMember.set(null);
    this.lastResponse.set(null);
    this.wrongBranchMember.set(null);
    this.pendingMember.set(null);

    const branchId = this.branchStore.selectedBranch()?.id;

    this.checkInService.verify(member.id, branchId).subscribe({
      next: (res) => {
        this.verifiedMember.set(res);
        this.lastResponse.set(res);
        this.loadingVerify.set(null);
        if (res.canEnter) {
          this.checkInService.checkIn({ memberId: member.id, type: 'entry', branchId }).subscribe();
        } else if (res.reason === 'wrong_branch' && res.member) {
          this.wrongBranchMember.set(res.member);
          this.pendingMember.set(member);
        }
      },
      error: (err) => {
        this.verifyError.set(err.error?.message || 'Error al verificar');
        this.loadingVerify.set(null);
      },
    });
  }

  changeBranchAndEnter(): void {
    const member = this.pendingMember();
    if (!member) return;
    const branchId = this.branchStore.selectedBranch()?.id;
    if (!branchId) return;

    this.memberService.updateBranch(member.id, branchId).subscribe({
      next: () => {
        this.wrongBranchMember.set(null);
        this.pendingMember.set(null);
        this.lastResponse.set(null);
        this.doEntry(member);
      },
    });
  }

  doExit(member: Member): void {
    this.checkInService.checkOut({ memberId: member.id, type: 'exit' }).subscribe();
  }

  loadActive(): void {
    this.checkInService.getActive().subscribe({
      next: (res) => this.activeMembers.set(res),
    });
  }
}
