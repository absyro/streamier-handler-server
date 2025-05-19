import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
} from "@nestjs/common";
import {
  ApiBadGatewayResponse,
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiHeader,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiServiceUnavailableResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { Request } from "express";
import { ReasonPhrases } from "http-status-codes";
import { dedent } from "ts-dedent";

import { CommonService } from "../common/common.service";
import { CreateStreamDto } from "./dto/create-stream.dto";
import { PartialStreamDto } from "./dto/partial-stream.dto";
import { StreamIdsDto } from "./dto/stream-ids.dto";
import { StreamDto } from "./dto/stream.dto";
import { UpdateStreamDto } from "./dto/update-stream.dto";
import { StreamsService } from "./streams.service";

@ApiBadGatewayResponse({
  description: "Received data from handler is invalid",
  schema: {
    properties: {
      error: {
        enum: [ReasonPhrases.BAD_GATEWAY],
        type: "string",
      },
      message: {
        type: "string",
      },
      statusCode: {
        enum: [HttpStatus.BAD_GATEWAY],
        type: "number",
      },
    },
    required: ["error", "message", "statusCode"],
    type: "object",
  },
})
@ApiNotFoundResponse({
  description: "Handler not found",
  schema: {
    properties: {
      error: {
        enum: [ReasonPhrases.NOT_FOUND],
        type: "string",
      },
      message: {
        type: "string",
      },
      statusCode: {
        enum: [HttpStatus.NOT_FOUND],
        type: "number",
      },
    },
    required: ["error", "message", "statusCode"],
    type: "object",
  },
})
@ApiParam({
  description: "ID of the target handler",
  name: "handlerId",
})
@ApiQuery({
  description: dedent`
  The fields to include in the response.

  Uses json-mask to select the fields to include in the response.

  See https://github.com/nemtsov/json-mask for more information.

  If not provided, all fields will be included.`,
  name: "fields",
  required: false,
  type: "string",
})
@ApiServiceUnavailableResponse({
  description: "Handler is offline",
  schema: {
    properties: {
      error: {
        enum: [ReasonPhrases.SERVICE_UNAVAILABLE],
        type: "string",
      },
      message: {
        type: "string",
      },
      statusCode: {
        enum: [HttpStatus.SERVICE_UNAVAILABLE],
        type: "number",
      },
    },
    required: ["error", "message", "statusCode"],
    type: "object",
  },
})
@ApiTags("Streams")
@ApiUnauthorizedResponse({
  description: "Missing or invalid authentication",
  schema: {
    properties: {
      error: {
        enum: [ReasonPhrases.UNAUTHORIZED],
        type: "string",
      },
      message: {
        type: "string",
      },
      statusCode: {
        enum: [HttpStatus.UNAUTHORIZED],
        type: "number",
      },
    },
    required: ["error", "message", "statusCode"],
    type: "object",
  },
})
@Controller("api/handlers/:handlerId/streams")
export class StreamsController {
  public constructor(
    private readonly streamsService: StreamsService,
    private readonly commonService: CommonService,
  ) {}

  @ApiBadRequestResponse({
    description: "Request body parameters are invalid",
    schema: {
      properties: {
        error: {
          enum: [ReasonPhrases.BAD_REQUEST],
          type: "string",
        },
        message: {
          oneOf: [
            {
              type: "string",
            },
            {
              items: {
                type: "string",
              },
              type: "array",
            },
          ],
        },
        statusCode: {
          enum: [HttpStatus.BAD_REQUEST],
          type: "number",
        },
      },
      required: ["error", "message", "statusCode"],
      type: "object",
    },
  })
  @ApiCreatedResponse({
    description: "Stream successfully created",
    type: StreamDto,
  })
  @ApiHeader({
    description: "Session ID for authentication",
    name: "X-Session-Id",
    required: true,
  })
  @ApiOperation({
    description: dedent`
    Creates a new stream associated with the specified handler.

    The stream will be configured according to the provided parameters and will be associated with the authenticated user.`,
    summary: "Create stream",
  })
  @Post()
  public async createStream(
    @Body() createStreamDto: CreateStreamDto,
    @Param("handlerId") handlerId: string,
    @Req() request: Request,
  ): Promise<StreamDto> {
    const userId = await this.commonService.getUserIdFromRequest(request);

    const stream = await this.streamsService.createStream(
      handlerId,
      userId,
      createStreamDto,
    );

    return stream;
  }

  @ApiHeader({
    description: "Session ID for authentication",
    name: "X-Session-Id",
    required: true,
  })
  @ApiNoContentResponse({
    description: "Stream successfully deleted",
  })
  @ApiOperation({
    description: dedent`
    Deletes the specified stream from the handler.

    This operation is permanent and cannot be undone. All associated data will be removed.`,
    summary: "Delete stream",
  })
  @ApiParam({
    description: "ID of the stream to delete",
    name: "streamId",
  })
  @Delete(":streamId")
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteStream(
    @Param("handlerId") handlerId: string,
    @Param("streamId") streamId: string,
    @Req() request: Request,
  ): Promise<void> {
    const userId = await this.commonService.getUserIdFromRequest(request);

    return this.streamsService.deleteStream(handlerId, userId, streamId);
  }

  @ApiHeader({
    description: "Session ID for authentication",
    name: "X-Session-Id",
  })
  @ApiOkResponse({
    description: "List of stream IDs for the user",
    type: StreamIdsDto,
  })
  @ApiOperation({
    description: "Retrieves IDs of all streams for the given user.",
    summary: "List user streams",
  })
  @Get()
  public async listStreamIds(
    @Param("handlerId") handlerId: string,
    @Req() request: Request,
  ): Promise<StreamIdsDto> {
    const userId = await this.commonService.getUserIdFromRequest(request);

    const streamIds = await this.streamsService.listStreamIds(
      handlerId,
      userId,
    );

    return streamIds;
  }

  @ApiHeader({
    description: "Session ID for authentication",
    name: "X-Session-Id",
  })
  @ApiOkResponse({
    description: "Stream information retrieved successfully",
    type: PartialStreamDto,
  })
  @ApiOperation({
    description: "Retrieves information about a specific stream.",
    summary: "Read stream",
  })
  @ApiParam({
    description: "ID of the stream to retrieve",
    name: "streamId",
  })
  @Get(":streamId")
  public async readStream(
    @Param("handlerId") handlerId: string,
    @Param("streamId") streamId: string,
    @Req() request: Request,
  ): Promise<PartialStreamDto> {
    const userId = await this.commonService.getUserIdFromRequest(request);

    const stream = await this.streamsService.readStream(
      handlerId,
      userId,
      streamId,
    );

    return stream;
  }

  @ApiBadRequestResponse({
    description: "Request body parameters are invalid",
    schema: {
      properties: {
        error: {
          enum: [ReasonPhrases.BAD_REQUEST],
          type: "string",
        },
        message: {
          oneOf: [
            {
              type: "string",
            },
            {
              items: {
                type: "string",
              },
              type: "array",
            },
          ],
        },
        statusCode: {
          enum: [HttpStatus.BAD_REQUEST],
          type: "number",
        },
      },
      required: ["error", "message", "statusCode"],
      type: "object",
    },
  })
  @ApiHeader({
    description: "Session ID for authentication",
    name: "X-Session-Id",
    required: true,
  })
  @ApiOkResponse({
    description: "Stream successfully updated",
    type: PartialStreamDto,
  })
  @ApiOperation({
    description: dedent`
    Updates the configuration of a specific stream.

    Only the provided fields will be updated, leaving other configuration unchanged.`,
    summary: "Update stream",
  })
  @ApiParam({
    description: "ID of the stream to update",
    name: "streamId",
  })
  @Put(":streamId")
  public async updateStream(
    @Param("handlerId") handlerId: string,
    @Param("streamId") streamId: string,
    @Body() updateStreamDto: UpdateStreamDto,
    @Req() request: Request,
  ): Promise<PartialStreamDto> {
    const userId = await this.commonService.getUserIdFromRequest(request);

    await this.streamsService.updateStream(
      handlerId,
      userId,
      streamId,
      updateStreamDto,
    );

    const stream = await this.streamsService.readStream(
      handlerId,
      userId,
      streamId,
    );

    return stream;
  }
}
