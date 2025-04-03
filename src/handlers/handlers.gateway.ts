import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { HandlersService } from "./handlers.service";
import { Handler } from "./entities/handler.entity";

@WebSocketGateway({ namespace: "handlers" })
export class HandlersGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private activeConnections = new Map<
    string,
    { socket: Socket; handler: Handler }
  >();

  constructor(private readonly handlersService: HandlersService) {}

  async handleConnection(socket: Socket) {
    const accessToken = socket.handshake.query.access_token as string;
    if (!accessToken) {
      socket.disconnect(true);
      return;
    }

    try {
      // @ts-expect-error
      const handler = await this.handlersService.findByAccessToken(accessToken);
      if (!handler) {
        socket.disconnect(true);
        return;
      }

      if (this.activeConnections.has(accessToken)) {
        socket.disconnect(true);
        return;
      }

      this.activeConnections.set(accessToken, { socket, handler });
    } catch (error) {
      socket.disconnect(true);
    }
  }

  handleDisconnect(socket: Socket) {
    for (const [token, conn] of this.activeConnections.entries()) {
      if (conn.socket === socket) {
        this.activeConnections.delete(token);
        break;
      }
    }
  }
}
