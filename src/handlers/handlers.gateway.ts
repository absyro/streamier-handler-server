import type { DefaultEventsMap, Server, Socket } from "socket.io";

import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { isString } from "class-validator";

import { HandlersService } from "./handlers.service";
import { HandlerSocketData } from "./interfaces/handler-socket-data.interface";

/**
 * WebSocket gateway for managing handler connections.
 *
 * Provides WebSocket functionality for:
 *
 * - Authenticating handler connections
 * - Managing handler socket sessions
 * - Preventing duplicate connections
 * - Associating sockets with handlers
 * - Tracking handler online/offline status
 *
 * @class HandlersGateway
 */
@WebSocketGateway({ namespace: "handlers" })
export class HandlersGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  /**
   * Socket.IO server instance.
   *
   * The WebSocket server instance that manages all socket connections.
   * Configured with custom socket data type for handler information.
   *
   * @property {Server} server
   */
  @WebSocketServer()
  public server!: Server<
    DefaultEventsMap,
    DefaultEventsMap,
    DefaultEventsMap,
    HandlerSocketData
  >;

  public constructor(private readonly handlersService: HandlersService) {}

  /**
   * Handles new WebSocket connections from handlers.
   *
   * Performs the following validations:
   *
   * 1. Verifies authentication token is present and valid
   * 2. Checks for existing connections with the same token
   * 3. Validates the handler exists in the database
   * 4. Associates the socket with the handler
   * 5. Sets the handler's online status to true
   *
   * If any validation fails, the connection is terminated.
   *
   * @param {Socket} socket - The connected socket instance
   */
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

    await this.handlersService.setOnlineStatus(handler.id, true);
  }

  /**
   * Handles WebSocket disconnections from handlers.
   *
   * When a handler disconnects:
   *
   * 1. Sets the handler's online status to false
   *
   * @param {Socket} socket - The disconnected socket instance
   */
  public async handleDisconnect(
    socket: Socket<
      DefaultEventsMap,
      DefaultEventsMap,
      DefaultEventsMap,
      HandlerSocketData
    >,
  ): Promise<void> {
    await this.handlersService.setOnlineStatus(socket.data.id, false);
  }
}
