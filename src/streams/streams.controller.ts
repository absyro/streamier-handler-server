import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UnauthorizedException,
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiHeader,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { Request } from "express";
import { isString } from "radash";

import { CommonService } from "../common/common.service";
import { StreamsService } from "./streams.service";

@ApiBadRequestResponse({
  description: "Invalid request parameters or body",
})
@ApiHeader({
  description: "Session ID for authentication",
  example: "1234567890",
  name: "X-Session-Id",
  required: true,
})
@ApiTags("Streams")
@ApiUnauthorizedResponse({
  description: "Missing or invalid authentication",
})
@Controller("api/streams/:handlerId")
export class StreamsController {
  public constructor(
    private readonly streamsService: StreamsService,
    private readonly commonService: CommonService,
  ) {}

  @ApiCreatedResponse({
    description: "Stream created successfully",
    schema: {
      example: {
        createdAt: "2023-01-01T00:00:00Z",
        id: "stream-456",
        status: "active",
      },
    },
  })
  @ApiForbiddenResponse({
    description:
      "User doesn't have permission to create streams on this handler",
  })
  @ApiNotFoundResponse({
    description: "Handler not found",
  })
  @ApiOperation({
    description: "Creates a new stream associated with the specified handler",
    summary: "Create a new stream",
  })
  @ApiParam({
    description: "ID of the handler to create the stream on",
    example: "handler-123",
    name: "handlerId",
  })
  @Post()
  public async createStream(
    @Body() data: unknown,
    @Param("handlerId") handlerId: string,
    @Req() request: Request,
  ): Promise<object> {
    const userId = await this.commonService.getUserIdFromRequest(request);

    if (!isString(userId)) {
      throw new UnauthorizedException();
    }

    return this.streamsService.createStream(handlerId, userId, data);
  }

  @ApiForbiddenResponse({
    description: "User doesn't have permission to delete this stream",
  })
  @ApiNotFoundResponse({
    description: "Handler or stream not found",
  })
  @ApiOkResponse({
    description: "Stream deleted successfully",
  })
  @ApiOperation({
    description: "Deletes the specified stream from the handler",
    summary: "Delete a stream",
  })
  @ApiParam({
    description: "ID of the handler containing the stream",
    example: "handler-123",
    name: "handlerId",
  })
  @ApiParam({
    description: "ID of the stream to delete",
    example: "stream-456",
    name: "streamId",
  })
  @Delete(":streamId")
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

  @ApiForbiddenResponse({
    description: "User doesn't have permission to view this stream",
  })
  @ApiNotFoundResponse({
    description: "Handler or stream not found",
  })
  @ApiOkResponse({
    description: "Stream details retrieved successfully",
    schema: {
      example: {
        configuration: {},
        createdAt: "2023-01-01T00:00:00Z",
        handlerId: "handler-123",
        id: "stream-456",
        status: "active",
        updatedAt: "2023-01-01T01:00:00Z",
      },
    },
  })
  @ApiOperation({
    description: "Retrieves details about the specified stream",
    summary: "Get stream details",
  })
  @ApiParam({
    description: "ID of the handler containing the stream",
    example: "handler-123",
    name: "handlerId",
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
  ): Promise<object> {
    const userId = await this.commonService.getUserIdFromRequest(request);

    if (!isString(userId)) {
      throw new UnauthorizedException();
    }

    return this.streamsService.readStream(handlerId, userId, streamId);
  }

  @ApiForbiddenResponse({
    description: "User doesn't have permission to update this stream",
  })
  @ApiNotFoundResponse({
    description: "Handler or stream not found",
  })
  @ApiOkResponse({
    description: "Stream updated successfully",
    schema: {
      example: {
        id: "stream-456",
        status: "updated",
        updatedAt: "2023-01-01T02:00:00Z",
      },
    },
  })
  @ApiOperation({
    description: "Updates configuration of the specified stream",
    summary: "Update a stream",
  })
  @ApiParam({
    description: "ID of the handler containing the stream",
    example: "handler-123",
    name: "handlerId",
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
    @Body() changes: unknown,
    @Req() request: Request,
  ): Promise<object> {
    const userId = await this.commonService.getUserIdFromRequest(request);

    if (!isString(userId)) {
      throw new UnauthorizedException();
    }

    return this.streamsService.updateStream(
      handlerId,
      userId,
      streamId,
      changes,
    );
  }
}
