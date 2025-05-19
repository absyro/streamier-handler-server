import { BadGatewayException, Injectable } from "@nestjs/common";
import { validate } from "nestjs-zod";
import { tryit } from "radash";
import { DataSource } from "typeorm";
import { z } from "zod";

import { CommonService } from "../common/common.service";
import { CreateStreamDto } from "./dto/create-stream.dto";
import { PartialStreamDto } from "./dto/partial-stream.dto";
import { StreamConfigurationSchemaDto } from "./dto/stream-configuration-schema";
import { StreamIdsDto } from "./dto/stream-ids.dto";
import { StreamDto } from "./dto/stream.dto";
import { UpdateStreamDto } from "./dto/update-stream.dto";
import { streamConfigurationSchemaSchema } from "./schemas/stream-configuration-schema.schema";
import { streamIdsSchema } from "./schemas/stream-ids.schema";
import { streamSchema } from "./schemas/stream.schema";

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
      z.object({ stream: streamSchema }),
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

  public async listStreamIds(
    handlerId: string,
    userId: null | string,
  ): Promise<StreamIdsDto> {
    const response = await this.commonService.emitToHandler(
      handlerId,
      "streams:list",
      userId,
    );

    const { streamIds } = validate(
      response,
      z.object({ streamIds: streamIdsSchema }),
      (zodError) => new BadGatewayException(zodError),
    );

    return streamIds;
  }

  public async readStream(
    handlerId: string,
    userId: null | string,
    streamId: string,
  ): Promise<PartialStreamDto> {
    const response = await this.commonService.emitToHandler(
      handlerId,
      "streams:read",
      userId,
      streamId,
    );

    const { stream } = validate(
      response,
      z.object({ stream: streamSchema.partial() }),
      (zodError) => new BadGatewayException(zodError),
    );

    return stream;
  }

  public async readStreamsConfigurationSchema(
    handlerId: string,
  ): Promise<StreamConfigurationSchemaDto["schema"]> {
    const response = await this.commonService.emitToHandler(
      handlerId,
      "streams:read-configuration-schema",
    );

    const { schema } = validate(
      response,
      z.object({ schema: streamConfigurationSchemaSchema }),
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
