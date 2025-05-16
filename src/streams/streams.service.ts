import { BadGatewayException, Injectable } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { isArray, isEmpty, isObject } from "radash";

import { CommonService } from "../common/common.service";
import { Stream } from "./classes/stream.class";
import { UpdateStreamDto } from "./dto/update-stream.dto";

@Injectable()
export class StreamsService {
  public constructor(private readonly commonService: CommonService) {}

  public async createStream(
    handlerId: string,
    userId: string,
    createStreamDto: Pick<Stream, "configuration" | "name">,
  ): Promise<Stream> {
    const response = await this.commonService.emitToHandler(
      handlerId,
      "streams:create",
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
    await this.commonService.emitToHandler(
      handlerId,
      "streams:delete",
      userId,
      streamId,
    );
  }

  public async listUserStreams(
    handlerId: string,
    userId: string,
  ): Promise<Stream[]> {
    const response = await this.commonService.emitToHandler(
      handlerId,
      "streams:list",
      userId,
    );

    if (!("streams" in response) || !isArray(response.streams)) {
      throw new BadGatewayException(
        "Received streams from handler are invalid",
      );
    }

    const streams = response.streams.map((stream: unknown) => {
      const instance = plainToInstance(Stream, stream);

      const errors = validateSync(instance);

      if (!isEmpty(errors)) {
        throw new BadGatewayException(
          "Received streams from handler are invalid",
        );
      }

      return instance;
    });

    return streams;
  }

  public async readStream(
    handlerId: string,
    userId: string,
    streamId: string,
  ): Promise<Stream> {
    const response = await this.commonService.emitToHandler(
      handlerId,
      "streams:read",
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
    await this.commonService.emitToHandler(
      handlerId,
      "streams:update",
      userId,
      streamId,
      updateStreamDto,
    );
  }
}
