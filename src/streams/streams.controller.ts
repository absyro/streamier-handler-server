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
  UnauthorizedException,
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
  PartialType,
} from "@nestjs/swagger";
import { Request } from "express";
import { ReasonPhrases } from "http-status-codes";
import { isString } from "radash";
import { dedent } from "ts-dedent";

import { CommonService } from "../common/common.service";
import { Stream } from "./classes/stream.class";
import { CreateStreamDto } from "./dto/create-stream.dto";
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
        example: "Received stream from handler is invalid",
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
@ApiHeader({
  description: "Session ID for authentication",
  example: "s123456789",
  name: "X-Session-Id",
  required: true,
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
        example: "Handler not found",
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
  example: "h1234567",
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
        example: "Handler is offline",
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
        example: "Missing or invalid authentication",
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
              example: "X must be a string",
              type: "string",
            },
            {
              items: {
                example: "X must be a string",
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
    type: Stream,
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
  ): Promise<Stream> {
    const userId = await this.commonService.getUserIdFromRequest(request);

    if (!isString(userId)) {
      throw new UnauthorizedException("Missing or invalid authentication");
    }

    return this.streamsService.createStream(handlerId, userId, createStreamDto);
  }

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
    example: "stream-456",
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

    if (!isString(userId)) {
      throw new UnauthorizedException("Missing or invalid authentication");
    }

    return this.streamsService.deleteStream(handlerId, userId, streamId);
  }

  @ApiOkResponse({
    description: "List of streams for the user",
    type: [PartialType(Stream)],
  })
  @ApiOperation({
    description:
      "Retrieves all streams associated with the authenticated user for the specified handler.",
    summary: "List user streams",
  })
  @Get()
  public async listUserStreams(
    @Param("handlerId") handlerId: string,
    @Req() request: Request,
  ): Promise<Stream[]> {
    const userId = await this.commonService.getUserIdFromRequest(request);

    if (!isString(userId)) {
      throw new UnauthorizedException("Missing or invalid authentication");
    }

    return this.streamsService.listUserStreams(handlerId, userId);
  }

  @ApiOkResponse({
    description: "Stream details retrieved successfully",
    type: Stream,
  })
  @ApiOperation({
    description: dedent`
    Retrieves detailed information about a specific stream.

    The response includes all configuration and current status of the stream.`,
    summary: "Read stream",
  })
  @ApiParam({
    description: "ID of the stream to retrieve",
    example: "stream-456",
    name: "streamId",
  })
  @Get(":streamId")
  public async readStream(
    @Param("handlerId") handlerId: string,
    @Param("streamId") streamId: string,
    @Req() request: Request,
  ): Promise<Stream> {
    const userId = await this.commonService.getUserIdFromRequest(request);

    if (!isString(userId)) {
      throw new UnauthorizedException("Missing or invalid authentication");
    }

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
              example: "X must be a string",
              type: "string",
            },
            {
              items: {
                example: "X must be a string",
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
  @ApiOkResponse({
    description: "Stream successfully updated",
    type: Stream,
  })
  @ApiOperation({
    description: dedent`
    Updates the configuration of a specific stream.

    Only the provided fields will be updated, leaving other configuration unchanged.`,
    summary: "Update stream",
  })
  @ApiParam({
    description: "ID of the stream to update",
    example: "stream-456",
    name: "streamId",
  })
  @Put(":streamId")
  public async updateStream(
    @Param("handlerId") handlerId: string,
    @Param("streamId") streamId: string,
    @Body() updateStreamDto: UpdateStreamDto,
    @Req() request: Request,
  ): Promise<Stream> {
    const userId = await this.commonService.getUserIdFromRequest(request);

    if (!isString(userId)) {
      throw new UnauthorizedException("Missing or invalid authentication");
    }

    await this.streamsService.updateStream(
      handlerId,
      userId,
      streamId,
      updateStreamDto,
    );

    return this.streamsService.readStream(handlerId, userId, streamId);
  }
}
