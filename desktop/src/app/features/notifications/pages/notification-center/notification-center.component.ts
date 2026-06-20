import { Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { NotificationService } from '../../services/notification.service';
import { PaginatedNotifications } from '../../interfaces/notification.interface';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [
    DatePipe, MatCardModule, MatButtonModule, MatIconModule, MatPaginatorModule,
  ],
  template: `
    <div class="p-8">
      <h1 class="text-2xl font-medium text-gray-800 mb-6">Centro de Notificaciones</h1>

      @if (!notifications) {
        <mat-card class="!rounded-xl !shadow-sm">
          <mat-card-content class="p-12 text-center text-gray-400">
            Cargando notificaciones...
          </mat-card-content>
        </mat-card>
      } @else if (!notifications.data.length) {
        <mat-card class="!rounded-xl !shadow-sm">
          <mat-card-content class="p-12 text-center text-gray-400">
            <mat-icon class="text-5xl mb-4">notifications_none</mat-icon>
            <p>No hay notificaciones</p>
          </mat-card-content>
        </mat-card>
      } @else {
        <mat-card class="!rounded-xl !shadow-sm">
          <mat-card-content class="p-0">
            <div class="divide-y">
              @for (item of notifications.data; track item.id) {
                <div class="flex items-start gap-4 p-4 hover:bg-gray-50"
                     [class.bg-blue-50]="!item.isRead">
                  <mat-icon class="mt-1 text-lg"
                            [class.text-blue-500]="!item.isRead"
                            [class.text-gray-400]="item.isRead">
                    {{ item.isRead ? 'notifications' : 'notification_important' }}
                  </mat-icon>
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-sm text-gray-800">{{ item.subject }}</p>
                    <p class="text-sm text-gray-500 mt-0.5">{{ item.body }}</p>
                    <p class="text-xs text-gray-400 mt-1">
                      {{ item.sentAt | date:'dd/MM/yy HH:mm' }}
                      @if (item.channel !== 'in_app') {
                        <span class="ml-2 uppercase text-[10px] font-medium px-1.5 py-0.5 rounded"
                              [class.bg-green-100]="item.channel === 'email'"
                              [class.bg-purple-100]="item.channel === 'whatsapp'">
                          {{ item.channel }}
                        </span>
                      }
                    </p>
                  </div>
                  @if (!item.isRead) {
                    <button mat-icon-button (click)="markRead(item.id)" class="!w-8 !h-8">
                      <mat-icon class="text-lg">check</mat-icon>
                    </button>
                  }
                </div>
              }
            </div>
          </mat-card-content>
        </mat-card>

        <mat-paginator [length]="notifications.total"
                       [pageSize]="notifications.limit"
                       [pageIndex]="notifications.page - 1"
                       (page)="onPage($event)"
                       class="mt-4">
        </mat-paginator>
      }
    </div>
  `,
})
export class NotificationCenterComponent implements OnInit {
  private readonly notificationService = inject(NotificationService);

  notifications: PaginatedNotifications | null = null;

  ngOnInit(): void {
    this.load();
  }

  private load(page = 1): void {
    this.notificationService.findAll({ page, limit: 20 }).subscribe({
      next: (data) => (this.notifications = data),
      error: () => (this.notifications = { data: [], total: 0, page, limit: 20 }),
    });
  }

  onPage(event: PageEvent): void {
    this.load(event.pageIndex + 1);
  }

  markRead(id: string): void {
    this.notificationService.markAsRead(id).subscribe(() => {
      this.load(this.notifications?.page ?? 1);
    });
  }
}
