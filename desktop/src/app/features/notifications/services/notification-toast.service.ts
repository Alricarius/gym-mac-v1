import { Injectable, inject, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SocketService } from '../../../core/services/socket.service';
import { Subscription } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NotificationToastService implements OnDestroy {
  private readonly snackBar = inject(MatSnackBar);
  private readonly socketService = inject(SocketService);
  private sub?: Subscription;

  constructor() {
    this.sub = this.socketService.onNotification().subscribe({
      next: (notification) => {
        this.snackBar.open(notification.subject, 'Cerrar', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['notification-toast'],
        });
      },
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
