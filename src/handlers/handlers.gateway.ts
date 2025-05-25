import type { DefaultEventsMap, Server, Socket } from "socket.io";

import { InjectRepository } from "@nestjs/typeorm";
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { isString } from "radash";
import { Repository } from "typeorm";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

import { Stream } from "@/streams/entities/stream.entity";

import { Handler } from "./entities/handler.entity";
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
    @InjectRepository(Handler)
    private readonly handlersRepository: Repository<Handler>,
    @InjectRepository(Stream)
    private readonly streamsRepository: Repository<Stream>,
  ) {}

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

    const handler = await this.handlersRepository.findOne({
      where: { authToken },
    });

    if (!handler) {
      socket.disconnect(true);

      return;
    }

    socket.data.id = handler.id;

    socket.data.isHostingStreams = false;

    await this.handlersRepository.update(handler.id, { isActive: true });
  }

  public async handleDisconnect(
    socket: Socket<
      DefaultEventsMap,
      DefaultEventsMap,
      DefaultEventsMap,
      HandlerSocketData
    >,
  ): Promise<void> {
    await this.handlersRepository.update(socket.data.id, { isActive: false });
  }

  @SubscribeMessage("start_streams")
  public async handleStartStreams(
    @ConnectedSocket()
    client: Socket<
      DefaultEventsMap,
      DefaultEventsMap,
      DefaultEventsMap,
      HandlerSocketData
    >,
  ): Promise<void> {
    client.data.isHostingStreams = true;

    const activeStreams = await this.streamsRepository.find({
      select: ["configuration", "id", "nodes", "variables"],
      where: { handlerId: client.data.id, isActive: true },
    });

    for (const stream of activeStreams) {
      client.emit("start_stream", stream, () => {});
    }
  }

  @SubscribeMessage("stream_communication")
  public async handleStreamCommunication(
    @ConnectedSocket()
    socket: Socket<
      DefaultEventsMap,
      DefaultEventsMap,
      DefaultEventsMap,
      HandlerSocketData
    >,

    @MessageBody() message: unknown,
  ): Promise<
    | {
        data: Record<string, unknown>;
        success: true;
      }
    | {
        error: string;
        success: false;
      }
  > {
    const messageSchema = z.object({
      data: z.record(z.unknown()),
      streamId: z.string().length(8),
    });

    const messageValidationResult = messageSchema.safeParse(message);

    if (!messageValidationResult.success) {
      return {
        error: fromZodError(messageValidationResult.error).message,
        success: false,
      };
    }

    const communicationResult = await new Promise<
      | {
          data: Record<string, unknown>;
          success: true;
        }
      | {
          error: string;
          success: false;
        }
    >((resolve) => {
      socket.emit(
        "stream_communication",
        messageValidationResult.data,
        (response: unknown) => {
          const responseSchema = z.discriminatedUnion("success", [
            z
              .object({
                data: z.record(z.unknown()),
                success: z.literal(true),
              })
              .strict(),
            z
              .object({
                error: z.string().nonempty().max(500),
                success: z.literal(false),
              })
              .strict(),
          ]);

          const responseValidationResult = responseSchema.safeParse(response);

          if (!responseValidationResult.success) {
            resolve({
              error: fromZodError(responseValidationResult.error).message,
              success: false,
            });

            return;
          }

          resolve(responseValidationResult.data);
        },
      );
    });

    return communicationResult;
  }
}
