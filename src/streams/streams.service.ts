import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
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
      throw new BadGatewayException(errors);
    }

    return stream;
  }

  public async deleteStream(
    handlerId: string,
    userId: string,
    streamId: string,
  ): Promise<void> {
    await this._emitToHandler(handlerId, "delete", userId, streamId);
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
      throw new BadGatewayException(errors);
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
      throw new BadGatewayException(updatedStreamErrors);
    }

    return updatedStream;
  }

  private async _emitToHandler(
    handlerId: string,
    event: string,
    ...data: unknown[]
  ): Promise<object> {
    const { server } = this.handlersGateway;

    const sockets = await server.fetchSockets();

    const socket = sockets.find(
      ({ data: socketData }) => socketData.id === handlerId,
    );

    if (!socket) {
      throw new NotFoundException();
    }

    return new Promise((resolve, reject) => {
      socket.emit(`stream:${event}`, ...data, (response: unknown) => {
        if (!isObject(response)) {
          reject(new BadGatewayException());

          return;
        }

        if (!("success" in response) || typeof response.success !== "boolean") {
          reject(new BadGatewayException());

          return;
        }

        if ("error" in response) {
          if (!isString(response.error)) {
            reject(new BadGatewayException());

            return;
          }

          if (response.success) {
            reject(new BadGatewayException());

            return;
          }

          reject(new BadRequestException(response.error));

          return;
        }

        if (!response.success) {
          reject(new BadGatewayException());

          return;
        }

        resolve(response);
      });
    });
  }
}
