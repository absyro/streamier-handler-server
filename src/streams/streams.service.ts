import {
  BadRequestException,
  Injectable,
  NotFoundException,
  NotImplementedException,
} from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { isEmpty, isObject, isString } from "radash";

import { HandlersGateway } from "../handlers/handlers.gateway";
import { Stream } from "./classes/stream.class";
import { UpdateStreamDto } from "./dto/update-stream.dto";

@Injectable()
export class StreamsService {
  public constructor(private readonly handlersGateway: HandlersGateway) {}

  public async createStream(
    handlerId: string,
    userId: string,
    createStreamDto: Pick<Stream, "configuration" | "name">,
  ): Promise<Stream> {
    const response = await this._emitToHandler(
      handlerId,
      "create",
      userId,
      createStreamDto,
    );

    const stream = plainToInstance(Stream, response);

    const errors = validateSync(stream);

    if (!isEmpty(errors)) {
      throw new BadRequestException(errors);
    }

    return stream;
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
  ): Promise<Stream> {
    const response = await this._emitToHandler(
      handlerId,
      "read",
      userId,
      streamId,
    );

    const stream = plainToInstance(Stream, response);

    const errors = validateSync(stream);

    if (!isEmpty(errors)) {
      throw new BadRequestException(errors);
    }

    return stream;
  }

  public async updateStream(
    handlerId: string,
    userId: string,
    streamId: string,
    updateStreamDto: UpdateStreamDto,
  ): Promise<Stream> {
    const response = await this._emitToHandler(
      handlerId,
      "update",
      userId,
      streamId,
      updateStreamDto,
    );

    const updatedStream = plainToInstance(Stream, response);

    const updatedStreamErrors = validateSync(updatedStream);

    if (!isEmpty(updatedStreamErrors)) {
      throw new BadRequestException(updatedStreamErrors);
    }

    return updatedStream;
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
          !isObject(response) ||
          !("success" in response) ||
          typeof response.success !== "boolean" ||
          ("error" in response && !isString(response.error))
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
