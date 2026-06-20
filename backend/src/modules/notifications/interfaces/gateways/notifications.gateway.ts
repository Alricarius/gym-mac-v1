import {
  WebSocketGateway, WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:4200', 'file://'],
    credentials: true,
  },
})
export class NotificationsGateway {
  @WebSocketServer()
  server: Server;

  emitNotification(notification: Record<string, unknown>): void {
    this.server.emit('notification:new', notification);
  }
}
