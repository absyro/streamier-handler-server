import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
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
import { dedent } from "ts-dedent";

import { CommonService } from "@/common/common.service";
import { BadGatewayResponseDto } from "@/common/dto/bad-gateway-response.dto";
import { BadRequestResponseDto } from "@/common/dto/bad-request-response.dto";
import { ForbiddenResponseDto } from "@/common/dto/forbidden-response.dto";
import { NotFoundResponseDto } from "@/common/dto/not-found-response.dto";
import { ServiceUnavailableResponseDto } from "@/common/dto/service-unavailable-response.dto";
import { UnauthorizedResponseDto } from "@/common/dto/unauthorized-response.dto";

import { CreateStreamDto } from "./dto/create-stream.dto";
import { PermittedStreamDto } from "./dto/permitted-stream.dto";
import { SearchStreamDto } from "./dto/search-stream.dto";
import { StreamDto } from "./dto/stream.dto";
import { UpdateStreamDto } from "./dto/update-stream.dto";
import { StreamsService } from "./streams.service";

@ApiBadGatewayResponse({
  description: "Received data from handler is invalid",
  type: BadGatewayResponseDto,
})
@ApiNotFoundResponse({
  description: "Handler not found",
  type: NotFoundResponseDto,
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
  type: ServiceUnavailableResponseDto,
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
    type: BadRequestResponseDto,
  })
  @ApiCreatedResponse({
    description: "Stream successfully created",
    type: StreamDto,
  })
  @ApiForbiddenResponse({
    description: "User has reached the maximum limit of streams (100)",
    type: ForbiddenResponseDto,
  })
  @ApiOperation({
    description: dedent`
    Creates a new stream associated with the specified handler.

    The stream will be configured according to the provided parameters and will be associated with the authenticated user.`,
    summary: "Create stream",
  })
  @ApiUnauthorizedResponse({
    description: "Missing or invalid authentication",
    type: UnauthorizedResponseDto,
  })
  @Post()
  public async createStream(
    @Body() createStreamDto: CreateStreamDto,
    @Headers("X-Session-Id") sessionId: string,
  ): Promise<StreamDto> {
    const userId = await this.commonService.getUserIdFromSessionId(sessionId);

    if (userId === null) {
      throw new UnauthorizedException("Missing or invalid authentication");
    }

    const stream = await this.streamsService.createOne(userId, createStreamDto);

    return stream;
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
  @ApiUnauthorizedResponse({
    description: "Missing or invalid authentication",
    type: UnauthorizedResponseDto,
  })
  @Delete(":streamId")
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteStream(
    @Param("streamId") streamId: string,
    @Headers("X-Session-Id") sessionId: string,
  ): Promise<void> {
    const userId = await this.commonService.getUserIdFromSessionId(sessionId);

    if (userId === null) {
      throw new UnauthorizedException("Missing or invalid authentication");
    }

    return this.streamsService.deleteOne(streamId, userId);
  }

  @ApiBadGatewayResponse({
    description: "Received data from handler is invalid",
    type: BadGatewayResponseDto,
  })
  @ApiNotFoundResponse({
    description: "Handler not found",
    type: NotFoundResponseDto,
  })
  @ApiOkResponse({
    description: "Stream configuration schema retrieved successfully",
    type: Object,
  })
  @ApiOperation({
    description: dedent`
    Gets the configuration schema for a stream from the specified handler.

    The schema defines the structure and validation rules for stream configuration.`,
    summary: "Get stream configuration schema",
  })
  @Get("configuration-schema/:handlerId")
  public async getStreamConfigurationSchema(
    @Param("handlerId") handlerId: string,
  ): Promise<Record<string, unknown>> {
    return this.streamsService.getStreamConfigurationSchema(handlerId);
  }

  @ApiBadRequestResponse({
    description: "Request query parameters are invalid",
    type: BadRequestResponseDto,
  })
  @ApiHeader({ name: "X-Session-Id", required: false })
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
    @Headers("X-Session-Id") sessionId?: string,
  ): Promise<PermittedStreamDto[]> {
    const userId =
      sessionId === undefined
        ? null
        : await this.commonService.getUserIdFromSessionId(sessionId);

    const streams = await this.streamsService.search(searchStreamDto);

    return streams.map((stream) =>
      this.streamsService.getPermittedStream(stream, userId),
    );
  }

  @ApiHeader({ name: "X-Session-Id", required: false })
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
    @Headers("X-Session-Id") sessionId?: string,
  ): Promise<PermittedStreamDto> {
    const userId =
      sessionId === undefined
        ? null
        : await this.commonService.getUserIdFromSessionId(sessionId);

    const stream = await this.streamsService.findOne(streamId);

    const permittedStream = this.streamsService.getPermittedStream(
      stream,
      userId,
    );

    return permittedStream;
  }

  @ApiBadRequestResponse({
    description: "Request body parameters are invalid",
    type: BadRequestResponseDto,
  })
  @ApiHeader({ name: "X-Session-Id", required: false })
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
  @Put(":streamId")
  public async updateStream(
    @Param("streamId") streamId: string,
    @Body() updateStreamDto: UpdateStreamDto,
    @Headers("X-Session-Id") sessionId?: string,
  ): Promise<PermittedStreamDto> {
    const userId =
      sessionId === undefined
        ? null
        : await this.commonService.getUserIdFromSessionId(sessionId);

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
