import { Logger } from "@nestjs/common";
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { ActiveConnection } from "src/websocket/interfaces/active-connection.interface";

import { HandlersService } from "./handlers.service";

@WebSocketGateway({ namespace: "handlers" })
export class HandlersGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  public server!: Server;

  private readonly _activeConnections = new Map<string, ActiveConnection>();

  public constructor(private readonly handlersService: HandlersService) {}

  public async handleConnection(socket: Socket): Promise<void> {
    const authToken = socket.handshake.auth.token as unknown;

    if (typeof authToken !== "string") {
      socket.disconnect(true);

      return;
    }

    const handler = await this.handlersService.findOneUsingAuthToken(authToken);

    if (!handler) {
      socket.disconnect(true);

      return;
    }

    if (this._activeConnections.has(authToken)) {
      socket.disconnect(true);

      return;
    }

    this._activeConnections.set(authToken, { handler, socket });

    Logger.log(`Handler ${handler.name} connected`, "HandlersGateway");
  }

  public handleDisconnect(socket: Socket): void {
    for (const [authToken, connection] of this._activeConnections.entries()) {
      if (connection.socket === socket) {
        this._activeConnections.delete(authToken);

        Logger.log(
          `Handler ${connection.handler.name} disconnected`,
          "HandlersGateway",
        );

        break;
      }
    }
  }
}
