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
  Query,
  Req,
  UnauthorizedException,
} from "@nestjs/common";
import {
  ApiBadGatewayResponse,
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiHeader,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
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
import { PermittedStreamDto } from "./dto/permitted-stream.dto";
import { SearchStreamDto } from "./dto/search-stream.dto";
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
@Controller("api/streams")
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
          type: "string",
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
  @ApiForbiddenResponse({
    description: "User has reached the maximum limit of streams (100)",
    schema: {
      properties: {
        error: {
          enum: [ReasonPhrases.FORBIDDEN],
          type: "string",
        },
        message: {
          type: "string",
        },
        statusCode: {
          enum: [HttpStatus.FORBIDDEN],
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
  @ApiOperation({
    description: dedent`
    Creates a new stream associated with the specified handler.

    The stream will be configured according to the provided parameters and will be associated with the authenticated user.`,
    summary: "Create stream",
  })
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
  @Post()
  public async createStream(
    @Body() createStreamDto: CreateStreamDto,
    @Req() request: Request,
  ): Promise<StreamDto> {
    const userId = await this.commonService.getUserIdFromRequest(request);

    if (userId === null) {
      throw new UnauthorizedException("Missing or invalid authentication");
    }

    const stream = await this.streamsService.createOne(userId, createStreamDto);

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
  @Delete(":streamId")
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteStream(
    @Param("streamId") streamId: string,
    @Req() request: Request,
  ): Promise<void> {
    const userId = await this.commonService.getUserIdFromRequest(request);

    if (userId === null) {
      throw new UnauthorizedException("Missing or invalid authentication");
    }

    return this.streamsService.deleteOne(streamId, userId);
  }

  @ApiBadRequestResponse({
    description: "Request query parameters are invalid",
    schema: {
      properties: {
        error: {
          enum: [ReasonPhrases.BAD_REQUEST],
          type: "string",
        },
        message: {
          type: "string",
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
    description: "List of streams matching the search criteria",
    type: [PermittedStreamDto],
  })
  @ApiOperation({
    description: dedent`
    Gets streams based on various criteria including:
    - Text search across stream name
    - Filter by active status
    - Filter by user ID
    - Filter by handler ID
    - Pagination support with limit and offset`,
    summary: "List streams",
  })
  @Get()
  public async listStreams(
    @Query() searchStreamDto: SearchStreamDto,
    @Req() request: Request,
  ): Promise<PermittedStreamDto[]> {
    const userId = await this.commonService.getUserIdFromRequest(request);

    const streams = await this.streamsService.search(searchStreamDto);

    return streams.map((stream) =>
      this.streamsService.getPermittedStream(stream, userId),
    );
  }

  @ApiHeader({
    description: "Session ID for authentication",
    name: "X-Session-Id",
  })
  @ApiHeader({
    description: "Session ID for authentication",
    name: "X-Session-Id",
  })
  @ApiOkResponse({
    description: "Stream information retrieved successfully",
    type: PermittedStreamDto,
  })
  @ApiOperation({
    description: "Retrieves information about a specific stream.",
    summary: "Read stream",
  })
  @Get(":streamId")
  public async readStream(
    @Param("streamId") streamId: string,
    @Req() request: Request,
  ): Promise<PermittedStreamDto> {
    const userId = await this.commonService.getUserIdFromRequest(request);

    const stream = await this.streamsService.findOne(streamId);

    const permittedStream = this.streamsService.getPermittedStream(
      stream,
      userId,
    );

    return permittedStream;
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
          type: "string",
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
    type: PermittedStreamDto,
  })
  @ApiOperation({
    description: dedent`
    Updates the configuration of a specific stream.

    Only the provided fields will be updated, leaving other configuration unchanged.`,
    summary: "Update stream",
  })
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
  @Put(":streamId")
  public async updateStream(
    @Param("streamId") streamId: string,
    @Body() updateStreamDto: UpdateStreamDto,
    @Req() request: Request,
  ): Promise<PermittedStreamDto> {
    const userId = await this.commonService.getUserIdFromRequest(request);

    if (userId === null) {
      throw new UnauthorizedException("Missing or invalid authentication");
    }

    const stream = await this.streamsService.updateOne(
      streamId,
      userId,
      updateStreamDto,
    );

    const permittedStream = this.streamsService.getPermittedStream(
      stream,
      userId,
    );

    return permittedStream;
  }
}
