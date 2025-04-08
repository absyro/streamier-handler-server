import {
  BadRequestException,
  Injectable,
  NotFoundException,
  NotImplementedException,
} from "@nestjs/common";
import { HandlersGateway } from "src/handlers/handlers.gateway";

@Injectable()
export class StreamsService {
  public constructor(private readonly handlersGateway: HandlersGateway) {}

  public async createStream(
    handlerId: string,
    userId: string,
    data: unknown,
  ): Promise<object> {
    return this._emitToHandler(handlerId, "create", userId, data);
  }

  public async deleteStream(
    handlerId: string,
    userId: string,
    streamId: string,
  ): Promise<void> {
    return this._emitToHandler(handlerId, "delete", userId, streamId);
  }

  public async readStream(
    handlerId: string,
    userId: string,
    streamId: string,
  ): Promise<object> {
    return this._emitToHandler(handlerId, "read", userId, streamId);
  }

  public async updateStream(
    handlerId: string,
    userId: string,
    streamId: string,
    changes: unknown,
  ): Promise<object> {
    return this._emitToHandler(handlerId, "update", userId, streamId, changes);
  }

  private async _emitToHandler<T>(
    handlerId: string,
    event: string,
    ...data: unknown[]
  ): Promise<T> {
    const { server } = this.handlersGateway;

    const sockets = await server.fetchSockets();

    const socket = sockets.find(
      ({ data: socketData }) => socketData.id === handlerId,
    );

    if (!socket) {
      throw new NotFoundException("Handler not found");
    }

    return new Promise((resolve, reject) => {
      socket.emit(`stream:${event}`, ...data, (response: unknown) => {
        if (
          !(response instanceof Object) ||
          !("success" in response) ||
          typeof response.success !== "boolean" ||
          ("error" in response && typeof response.error !== "string")
        ) {
          reject(new NotImplementedException("Invalid response format"));

          return;
        }

        if ("error" in response) {
          reject(new BadRequestException(response.error));

          return;
        }

        resolve(response as T);
      });
    });
  }
}
