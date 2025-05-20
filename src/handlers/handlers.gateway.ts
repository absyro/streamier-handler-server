import type { DefaultEventsMap, Server, Socket } from "socket.io";

import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { isString } from "radash";

import { HandlersService } from "./handlers.service";
import { HandlerSocketData } from "./interfaces/handler-socket-data.interface";

@WebSocketGateway({ namespace: "handlers" })
export class HandlersGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  public server!: Server<
    DefaultEventsMap,
    DefaultEventsMap,
    DefaultEventsMap,
    HandlerSocketData
  >;

  public constructor(private readonly handlersService: HandlersService) {}

  public async handleConnection(
    socket: Socket<
      DefaultEventsMap,
      DefaultEventsMap,
      DefaultEventsMap,
      HandlerSocketData
    >,
  ): Promise<void> {
    const authToken = socket.handshake.auth.token as unknown;

    if (!isString(authToken)) {
      socket.disconnect(true);

      return;
    }

    const sockets = await this.server.fetchSockets();

    if (
      sockets.some(
        (s) => s.handshake.auth.token === authToken && s.id !== socket.id,
      )
    ) {
      socket.disconnect(true);

      return;
    }

    const handler = await this.handlersService.findOneUsingAuthToken(authToken);

    if (!handler) {
      socket.disconnect(true);

      return;
    }

    socket.data.id = handler.id;

    await this.handlersService.updateOne(handler.id, { isOnline: true });
  }

  public async handleDisconnect(
    socket: Socket<
      DefaultEventsMap,
      DefaultEventsMap,
      DefaultEventsMap,
      HandlerSocketData
    >,
  ): Promise<void> {
    await this.handlersService.updateOne(socket.data.id, { isOnline: false });
  }
}
