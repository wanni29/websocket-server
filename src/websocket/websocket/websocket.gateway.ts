import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';

@WebSocketGateway()
export class WebsocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;
  private clients: Set<WebSocket> = new Set();

  afterInit(server: Server) {
    console.log('WebSocket server initialized');
  }

  handleConnection(client: WebSocket, ...args: any[]) {
    console.log('Client connected:', client);
    this.clients.add(client);
  }

  handleDisconnect(client: WebSocket) {
    console.log('Client disconnected:', client);
    this.clients.delete(client);
  }

  @SubscribeMessage('message')
  handleMessage(@MessageBody() message: string): void {
    // 재료 원본
    console.log(`message => ${message}`);
    try {
      console.log('Received message:', message);

      this.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              senderId: message['senderId'],
              data: message['message'],
            }),
          );
        }
      });
    } catch (error) {
      console.error('Error parsing message : ', error);
    }
  }
}
