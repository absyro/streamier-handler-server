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
  ApiTags,
  ApiUnauthorizedResponse,
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
        oneOf: [
          {
            example: "Received stream from handler is invalid",
            type: "string",
          },
          {
            items: {
              example: "Received stream from handler is invalid",
              type: "string",
            },
            type: "array",
          },
        ],
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
@ApiTags("Streams")
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
        message: {
          enum: [ReasonPhrases.NOT_FOUND],
          type: "string",
        },
        statusCode: {
          enum: [HttpStatus.NOT_FOUND],
          type: "number",
        },
      },
      required: ["message", "statusCode"],
      type: "object",
    },
  })
  @ApiOperation({
    description: dedent`
    Creates a new stream associated with the specified handler.

    The stream will be configured according to the provided parameters and will be associated with the authenticated user.`,
    summary: "Create a new stream",
  })
  @ApiParam({
    description: "ID of the handler to create the stream on",
    example: "h1234567",
    name: "handlerId",
  })
  @ApiUnauthorizedResponse({
    description: "Missing or invalid authentication",
    schema: {
      properties: {
        message: {
          enum: [ReasonPhrases.UNAUTHORIZED],
          type: "string",
        },
        statusCode: {
          enum: [HttpStatus.UNAUTHORIZED],
          type: "number",
        },
      },
      required: ["message", "statusCode"],
      type: "object",
    },
  })
  @Post()
  public async createStream(
    @Body() createStreamDto: CreateStreamDto,
    @Param("handlerId") handlerId: string,
    @Req() request: Request,
  ): Promise<Stream> {
    const userId = await this.commonService.getUserIdFromRequest(request);

    if (!isString(userId)) {
      throw new UnauthorizedException();
    }

    return this.streamsService.createStream(handlerId, userId, createStreamDto);
  }

  @ApiHeader({
    description: "Session ID for authentication",
    example: "s123456789",
    name: "X-Session-Id",
    required: true,
  })
  @ApiNoContentResponse({
    description: "Stream successfully deleted",
  })
  @ApiNotFoundResponse({
    description: "Handler not found",
    schema: {
      properties: {
        message: {
          enum: [ReasonPhrases.NOT_FOUND],
          type: "string",
        },
        statusCode: {
          enum: [HttpStatus.NOT_FOUND],
          type: "number",
        },
      },
      required: ["message", "statusCode"],
      type: "object",
    },
  })
  @ApiOperation({
    description: dedent`
    Deletes the specified stream from the handler.

    This operation is permanent and cannot be undone. All associated data will be removed.`,
    summary: "Delete a stream",
  })
  @ApiParam({
    description: "ID of the handler containing the stream",
    example: "h1234567",
    name: "handlerId",
  })
  @ApiParam({
    description: "ID of the stream to delete",
    example: "stream-456",
    name: "streamId",
  })
  @ApiUnauthorizedResponse({
    description: "Missing or invalid authentication",
    schema: {
      properties: {
        message: {
          enum: [ReasonPhrases.UNAUTHORIZED],
          type: "string",
        },
        statusCode: {
          enum: [HttpStatus.UNAUTHORIZED],
          type: "number",
        },
      },
      required: ["message", "statusCode"],
      type: "object",
    },
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
      throw new UnauthorizedException();
    }

    return this.streamsService.deleteStream(handlerId, userId, streamId);
  }

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
        message: {
          enum: [ReasonPhrases.NOT_FOUND],
          type: "string",
        },
        statusCode: {
          enum: [HttpStatus.NOT_FOUND],
          type: "number",
        },
      },
      required: ["message", "statusCode"],
      type: "object",
    },
  })
  @ApiOkResponse({
    description: "Stream details retrieved successfully",
    type: Stream,
  })
  @ApiOperation({
    description: dedent`
    Retrieves detailed information about a specific stream.

    The response includes all configuration and current status of the stream.`,
    summary: "Get stream details",
  })
  @ApiParam({
    description: "ID of the handler containing the stream",
    example: "h1234567",
    name: "handlerId",
  })
  @ApiParam({
    description: "ID of the stream to retrieve",
    example: "stream-456",
    name: "streamId",
  })
  @ApiUnauthorizedResponse({
    description: "Missing or invalid authentication",
    schema: {
      properties: {
        message: {
          enum: [ReasonPhrases.UNAUTHORIZED],
          type: "string",
        },
        statusCode: {
          enum: [HttpStatus.UNAUTHORIZED],
          type: "number",
        },
      },
      required: ["message", "statusCode"],
      type: "object",
    },
  })
  @Get(":streamId")
  public async readStream(
    @Param("handlerId") handlerId: string,
    @Param("streamId") streamId: string,
    @Req() request: Request,
  ): Promise<Stream> {
    const userId = await this.commonService.getUserIdFromRequest(request);

    if (!isString(userId)) {
      throw new UnauthorizedException();
    }

    return this.streamsService.readStream(handlerId, userId, streamId);
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
        message: {
          enum: [ReasonPhrases.NOT_FOUND],
          type: "string",
        },
        statusCode: {
          enum: [HttpStatus.NOT_FOUND],
          type: "number",
        },
      },
      required: ["message", "statusCode"],
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
    summary: "Update a stream",
  })
  @ApiParam({
    description: "ID of the handler containing the stream",
    example: "h1234567",
    name: "handlerId",
  })
  @ApiParam({
    description: "ID of the stream to update",
    example: "stream-456",
    name: "streamId",
  })
  @ApiUnauthorizedResponse({
    description: "Missing or invalid authentication",
    schema: {
      properties: {
        message: {
          enum: [ReasonPhrases.UNAUTHORIZED],
          type: "string",
        },
        statusCode: {
          enum: [HttpStatus.UNAUTHORIZED],
          type: "number",
        },
      },
      required: ["message", "statusCode"],
      type: "object",
    },
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
      throw new UnauthorizedException();
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
