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

    if (!("stream" in response) || !isObject(response.stream)) {
      throw new BadGatewayException("Received stream from handler is invalid");
    }

    const stream = plainToInstance(Stream, response.stream);

    const errors = validateSync(stream);

    if (!isEmpty(errors)) {
      throw new BadGatewayException("Received stream from handler is invalid");
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

    if (!("stream" in response) || !isObject(response.stream)) {
      throw new BadGatewayException("Received stream from handler is invalid");
    }

    const stream = plainToInstance(Stream, response.stream);

    const errors = validateSync(stream);

    if (!isEmpty(errors)) {
      throw new BadGatewayException("Received stream from handler is invalid");
    }

    return stream;
  }

  public async updateStream(
    handlerId: string,
    userId: string,
    streamId: string,
    updateStreamDto: UpdateStreamDto,
  ): Promise<void> {
    await this._emitToHandler(
      handlerId,
      "update",
      userId,
      streamId,
      updateStreamDto,
    );
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
          reject(
            new BadGatewayException(
              "Received response from handler is invalid",
            ),
          );

          return;
        }

        if (!("success" in response) || typeof response.success !== "boolean") {
          reject(
            new BadGatewayException(
              "Received response from handler is invalid",
            ),
          );

          return;
        }

        if ("error" in response) {
          if (!isString(response.error)) {
            reject(
              new BadGatewayException(
                "Received response from handler is invalid",
              ),
            );

            return;
          }

          if (response.success) {
            reject(
              new BadGatewayException(
                "Received response from handler is invalid",
              ),
            );

            return;
          }

          reject(new BadRequestException(response.error));

          return;
        }

        if (!response.success) {
          reject(
            new BadGatewayException(
              "Received response from handler is invalid",
            ),
          );

          return;
        }

        resolve(response);
      });
    });
  }
}
