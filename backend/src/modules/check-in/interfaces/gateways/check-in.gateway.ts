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
export class CheckInGateway {
  @WebSocketServer()
  server: Server;

  emitCheckInUpdate(): void {
    this.server.emit('check-in:updated');
  }
}
