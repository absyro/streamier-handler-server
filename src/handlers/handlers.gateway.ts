import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { HandlersService } from "./handlers.service";
import { StreamsService } from "../streams/streams.service";
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

  constructor(
    private readonly handlersService: HandlersService,
    private readonly streamsService: StreamsService,
  ) {}

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
  @SubscribeMessage("stream:create")
  async handleStreamCreate(
    client: Socket,
    payload: {
      configuration: Record<string, unknown>;
      name: string;
      handlerId: string;
    },
  ): Promise<{ error?: string; success: boolean; stream?: any }> {
    try {
      const connection = this.getConnectionBySocket(client);
      if (!connection) {
        return { error: "Not authorized", success: false };
      }

      const createDto = {
        name: payload.name,
        configuration: payload.configuration,
        handlerId: payload.handlerId,
      };

      const stream = await this.streamsService.create(createDto);
      return { success: true, stream };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Unknown error",
        success: false,
      };
    }
  }

  @SubscribeMessage("stream:read")
  async handleStreamRead(
    client: Socket,
    streamId: string,
  ): Promise<{ error?: string; success: boolean; stream?: any }> {
    try {
      const connection = this.getConnectionBySocket(client);
      if (!connection) {
        return { error: "Not authorized", success: false };
      }

      const stream = await this.streamsService.findOne(streamId);
      if (!stream) {
        return { error: "Stream not found", success: false };
      }

      return { success: true, stream };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Unknown error",
        success: false,
      };
    }
  }

  @SubscribeMessage("stream:update")
  async handleStreamUpdate(
    client: Socket,
    payload: { streamId: string; changes: any },
  ): Promise<{ error?: string; success: boolean; stream?: any }> {
    try {
      const connection = this.getConnectionBySocket(client);
      if (!connection) {
        return { error: "Not authorized", success: false };
      }

      const updated = await this.streamsService.update(
        payload.streamId,
        payload.changes,
      );
      return { success: true, stream: updated };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Unknown error",
        success: false,
      };
    }
  }

  @SubscribeMessage("stream:delete")
  async handleStreamDelete(
    client: Socket,
    streamId: string,
  ): Promise<{ error?: string; success: boolean }> {
    try {
      const connection = this.getConnectionBySocket(client);
      if (!connection) {
        return { error: "Not authorized", success: false };
      }

      await this.streamsService.remove(streamId);
      return { success: true };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Unknown error",
        success: false,
      };
    }
  }

  private getConnectionBySocket(
    socket: Socket,
  ): { socket: Socket; handler: Handler } | undefined {
    for (const conn of this.activeConnections.values()) {
      if (conn.socket === socket) {
        return conn;
      }
    }
    return undefined;
  }
}
