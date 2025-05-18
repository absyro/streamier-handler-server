import { BadGatewayException, Injectable } from "@nestjs/common";
import { validate } from "nestjs-zod";
import { tryit } from "radash";
import { DataSource } from "typeorm";
import { z } from "zod";

import { CommonService } from "../common/common.service";
import { CreateStreamDto } from "./dto/create-stream.dto";
import { UpdateStreamDto } from "./dto/update-stream.dto";
import { StreamConfigurationSchemaResponse } from "./responses/stream-configuration-schema.response";
import { StreamDto, StreamSchema } from "./schemas/stream.schema";

@Injectable()
export class StreamsService {
  public constructor(
    private readonly dataSource: DataSource,
    private readonly commonService: CommonService,
  ) {}

  public async createStream(
    handlerId: string,
    userId: null | string,
    createStreamDto: CreateStreamDto,
  ): Promise<StreamDto> {
    const response = await this.commonService.emitToHandler(
      handlerId,
      "streams:create",
      userId,
      createStreamDto,
    );

    const { stream } = validate(
      response,
      z.object({
        stream: StreamSchema.refine(
          (s) =>
            s.configuration === createStreamDto.configuration &&
            s.name === createStreamDto.name &&
            s.visibility === createStreamDto.visibility,
          "Received stream properties do not match requested properties",
        ),
      }),
      (zodError) => new BadGatewayException(zodError),
    );

    await this.dataSource.query(
      "INSERT INTO user_streams (id, handler_id, user_id, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW())",
      [stream.id, handlerId, userId],
    );

    return stream;
  }

  public async deleteStream(
    handlerId: string,
    userId: null | string,
    streamId: string,
  ): Promise<void> {
    await tryit(this.dataSource.query.bind(this.dataSource))(
      "DELETE FROM user_streams WHERE id = $1 AND handler_id = $2 AND user_id = $3",
      [streamId, handlerId, userId],
    );

    await this.commonService.emitToHandler(
      handlerId,
      "streams:delete",
      userId,
      streamId,
    );
  }

  public async listUserStreams(
    handlerId: string,
    userId: null | string,
  ): Promise<StreamDto[]> {
    const response = await this.commonService.emitToHandler(
      handlerId,
      "streams:list",
      userId,
    );

    const { streams } = validate(
      response,
      z.object({ streams: z.array(StreamSchema) }),
      (zodError) => new BadGatewayException(zodError),
    );

    return streams;
  }

  public async readStream(
    handlerId: string,
    userId: null | string,
    streamId: string,
  ): Promise<StreamDto> {
    const response = await this.commonService.emitToHandler(
      handlerId,
      "streams:read",
      userId,
      streamId,
    );

    const { stream } = validate(
      response,
      z.object({
        stream: StreamSchema.refine(
          (s) => s.id === streamId,
          "Received stream id does not match requested stream id",
        ),
      }),
      (zodError) => new BadGatewayException(zodError),
    );

    return stream;
  }

  public async readStreamsConfigurationSchema(
    handlerId: string,
  ): Promise<StreamConfigurationSchemaResponse["schema"]> {
    const response = await this.commonService.emitToHandler(
      handlerId,
      "streams:read-configuration-schema",
    );

    const { schema } = validate(
      response,
      z.object({ schema: z.record(z.unknown()) }),
      (zodError) => new BadGatewayException(zodError),
    );

    return schema;
  }

  public async updateStream(
    handlerId: string,
    userId: null | string,
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
