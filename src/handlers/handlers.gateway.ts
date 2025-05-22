import type { DefaultEventsMap, Server, Socket } from "socket.io";

import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from "@nestjs/websockets";
import { isString, tryit } from "radash";

import { StreamDto } from "@/streams/dto/stream.dto";
import { StreamsService } from "@/streams/streams.service";

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

  public constructor(
    private readonly handlersService: HandlersService,
    private readonly streamsService: StreamsService,
  ) {}

  @SubscribeMessage("settings:canHostStreams")
  public handleCanHostStreams(
    @ConnectedSocket()
    client: Socket<
      DefaultEventsMap,
      DefaultEventsMap,
      DefaultEventsMap,
      HandlerSocketData
    >,
    @MessageBody() canHostStreams: unknown,
  ): void {
    if (typeof canHostStreams !== "boolean") {
      throw new WsException("Invalid canHostStreams state");
    }

    client.data.canHostStreams = canHostStreams;
  }

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

    socket.data.canHostStreams = false;

    await this.handlersService.updateOne(handler.id, { isActive: true });
  }

  public async handleDisconnect(
    socket: Socket<
      DefaultEventsMap,
      DefaultEventsMap,
      DefaultEventsMap,
      HandlerSocketData
    >,
  ): Promise<void> {
    await this.handlersService.updateOne(socket.data.id, { isActive: false });
  }

  @SubscribeMessage("streams:get")
  public async handleGetStream(
    @ConnectedSocket()
    client: Socket<
      DefaultEventsMap,
      DefaultEventsMap,
      DefaultEventsMap,
      HandlerSocketData
    >,
    @MessageBody() streamId: unknown,
  ): Promise<
    Pick<
      StreamDto,
      "configuration" | "id" | "name" | "nodes" | "userId" | "variables"
    >
  > {
    if (!isString(streamId)) {
      throw new WsException("Invalid stream ID");
    }

    const [error, stream] = await tryit(this.streamsService.findOne.bind(this))(
      streamId,
      {
        select: ["configuration", "id", "name", "nodes", "userId", "variables"],
      },
    );

    if (error) {
      throw new WsException("Stream not found");
    }

    if (stream.handlerId !== client.data.id) {
      throw new WsException("You are not authorized to access this stream");
    }

    return {
      configuration: stream.configuration,
      id: stream.id,
      name: stream.name,
      nodes: stream.nodes,
      userId: stream.userId,
      variables: stream.variables,
    };
  }
}
