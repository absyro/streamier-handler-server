import {
  BadRequestException,
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
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiHeader,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { plainToInstance } from "class-transformer";
import { isEmpty, validateSync } from "class-validator";
import { Request } from "express";
import { isString } from "radash";

import { CommonService } from "../common/common.service";
import { Stream } from "./classes/stream.class";
import { StreamsService } from "./streams.service";

/**
 * Controller for managing data streams.
 *
 * Provides REST endpoints for:
 *
 * - Creating new streams
 * - Reading stream data
 * - Updating stream data
 * - Deleting streams
 *
 * All endpoints require authentication via X-Session-Id header.
 *
 * @class StreamsController
 */
@ApiBadRequestResponse({
  description: "Invalid request parameters or body",
})
@ApiHeader({
  description: "Session ID for authentication",
  example: "s123456789",
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

  /**
   * Creates a new stream for a handler.
   *
   * @param {unknown} data - The initial data for the stream
   * @param {string} handlerId - The ID of the handler to create the stream on
   * @param {Request} request - The HTTP request object
   * @returns The created stream data
   * @throws {UnauthorizedException} If user is not authenticated
   * @throws {NotFoundException} If handler is not found
   * @throws {ForbiddenException} If user doesn't have permission
   * @throws {BadRequestException} If request is invalid
   */
  @ApiCreatedResponse({
    description: "Stream created successfully",
    type: Stream,
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
    example: "h1234567",
    name: "handlerId",
  })
  @Post()
  public async createStream(
    @Body() body: unknown,
    @Param("handlerId") handlerId: string,
    @Req() request: Request,
  ): Promise<Stream> {
    const streamParameters = plainToInstance(Stream, body);

    const errors = validateSync(streamParameters);

    if (!isEmpty(errors)) {
      throw new BadRequestException(errors);
    }

    const userId = await this.commonService.getUserIdFromRequest(request);

    if (!isString(userId)) {
      throw new UnauthorizedException();
    }

    return this.streamsService.createStream(
      handlerId,
      userId,
      streamParameters,
    );
  }

  /**
   * Deletes a stream.
   *
   * @param {string} handlerId - The ID of the handler containing the stream
   * @param {string} streamId - The ID of the stream to delete
   * @param {Request} request - The HTTP request object
   * @throws {UnauthorizedException} If user is not authenticated
   * @throws {NotFoundException} If handler or stream is not found
   * @throws {ForbiddenException} If user doesn't have permission
   */
  @ApiForbiddenResponse({
    description: "User doesn't have permission to delete this stream",
  })
  @ApiNoContentResponse({
    description: "Stream deleted successfully",
  })
  @ApiNotFoundResponse({
    description: "Handler or stream not found",
  })
  @ApiOperation({
    description: "Deletes the specified stream from the handler",
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

  /**
   * Reads data from a stream.
   *
   * @param {string} handlerId - The ID of the handler containing the stream
   * @param {string} streamId - The ID of the stream to read
   * @param {Request} request - The HTTP request object
   * @returns The stream data
   * @throws {UnauthorizedException} If user is not authenticated
   * @throws {NotFoundException} If handler or stream is not found
   * @throws {ForbiddenException} If user doesn't have permission
   */
  @ApiForbiddenResponse({
    description: "User doesn't have permission to view this stream",
  })
  @ApiNotFoundResponse({
    description: "Handler or stream not found",
  })
  @ApiOkResponse({
    description: "Stream details retrieved successfully",
    type: Stream,
  })
  @ApiOperation({
    description: "Retrieves details about the specified stream",
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

  /**
   * Updates data in a stream.
   *
   * @param {string} handlerId - The ID of the handler containing the stream
   * @param {string} streamId - The ID of the stream to update
   * @param {Partial<Stream>} changes - The changes to apply to the stream
   * @param {Request} request - The HTTP request object
   * @returns The updated stream data
   * @throws {UnauthorizedException} If user is not authenticated
   * @throws {NotFoundException} If handler or stream is not found
   * @throws {ForbiddenException} If user doesn't have permission
   * @throws {BadRequestException} If request is invalid
   */
  @ApiForbiddenResponse({
    description: "User doesn't have permission to update this stream",
  })
  @ApiNotFoundResponse({
    description: "Handler or stream not found",
  })
  @ApiOkResponse({
    description: "Stream updated successfully",
    type: Stream,
  })
  @ApiOperation({
    description: "Updates configuration of the specified stream",
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
  @Put(":streamId")
  public async updateStream(
    @Param("handlerId") handlerId: string,
    @Param("streamId") streamId: string,
    @Body() changes: Partial<Stream>,
    @Req() request: Request,
  ): Promise<Stream> {
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
