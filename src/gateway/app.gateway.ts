import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthenticatedSocket } from './authenticated-socket-io.adapter';
import { USER_ROLE } from 'src/modules/users/user-role.enums';
import { OnEvent } from '@nestjs/event-emitter';

@WebSocketGateway({ cors: true })
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: AuthenticatedSocket) {
    console.log(`Client connected: ${client.id}`);

    console.log(`Client connected:`, client.user);
    if (client.user?.role === USER_ROLE.ADMIN) {
      console.log(`Client connected: ${client.id} - ADMIN`);
      client.join('admin');
    } else if (client.user?.role === USER_ROLE.MANAGER) {
      console.log(`Client connected: ${client.id} - MANAGER`);
      client.join(`manager_${client.user.userId}`);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() message: string,
    @ConnectedSocket() client: Socket,
  ) {
    console.log(`Message from client ${client.id}: ${message}`);

    // Emit response directly to the same client
    client.emit('response', `Server received: ${message}`);
  }

  // WhatsApp Events
  @OnEvent('whatsapp.qr')
  handleWhatsAppQR(qr: string) {
    this.server.emit('whatsapp:qr', qr);
  }

  @OnEvent('whatsapp.ready')
  handleWhatsAppReady() {
    this.server.emit('whatsapp:ready');
  }

  @OnEvent('whatsapp.disconnected')
  handleWhatsAppDisconnected() {
    this.server.emit('whatsapp:disconnected');
  }
}
