import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket | null = null;
  readonly connected = signal(false);

  connect(): void {
    if (this.socket?.connected) return;

    this.socket = io('http://localhost:3000', {
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => this.connected.set(true));
    this.socket.on('disconnect', () => this.connected.set(false));
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
    this.connected.set(false);
  }

  onCheckInUpdate(): Observable<void> {
    return new Observable((observer) => {
      if (!this.socket) {
        observer.error(new Error('Socket not connected'));
        return;
      }
      this.socket.on('check-in:updated', () => observer.next());
      return () => this.socket?.off('check-in:updated');
    });
  }
}
