import {
  BadRequestException,
  Injectable,
  NotFoundException,
  NotImplementedException,
} from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { validateOrReject } from "class-validator";
import { HandlersGateway } from "src/handlers/handlers.gateway";

import { CreateStreamDto } from "./dto/create-stream.dto";
import { UpdateStreamDto } from "./dto/update-stream.dto";

@Injectable()
export class StreamsService {
  public constructor(private readonly handlersGateway: HandlersGateway) {}

  public async createStream(
    handlerId: string,
    userId: string,
    createStreamDto: CreateStreamDto,
  ): Promise<object> {
    await this._validateData(CreateStreamDto, createStreamDto);

    return this._emitToHandler(handlerId, "create", userId, createStreamDto);
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
    updateStreamDto: UpdateStreamDto,
  ): Promise<object> {
    await this._validateData(UpdateStreamDto, updateStreamDto);

    return this._emitToHandler(
      handlerId,
      "update",
      userId,
      streamId,
      updateStreamDto,
    );
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

  private async _validateData(
    dtoClass: new () => object,
    data: unknown,
  ): Promise<void> {
    const dto = plainToInstance(dtoClass, data);

    try {
      await validateOrReject(dto);
    } catch (errors) {
      throw new BadRequestException(errors);
    }
  }
}
