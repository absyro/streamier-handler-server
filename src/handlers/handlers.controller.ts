import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UnauthorizedException,
} from "@nestjs/common";
import {
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
  OmitType,
  PickType,
} from "@nestjs/swagger";
import { isString } from "class-validator";
import { Request } from "express";
import { dedent } from "ts-dedent";

import { CommonService } from "../common/common.service";
import { CreateHandlerDto } from "./dto/create-handler.dto";
import { SearchHandlerDto } from "./dto/search-handler.dto";
import { UpdateHandlerDto } from "./dto/update-handler.dto";
import { Handler } from "./entities/handler.entity";
import { HandlersService } from "./handlers.service";

/**
 * Controller for managing stream handlers.
 *
 * Provides REST API endpoints for:
 *
 * - Creating new handlers
 * - Getting handlers
 * - Getting handler authentication token
 * - Getting handler details
 * - Deleting handlers
 * - Updating handler configurations
 *
 * @class HandlersController
 */
@ApiBadRequestResponse({ description: "Invalid request parameters or body" })
@ApiTags("Handlers")
@ApiUnauthorizedResponse({ description: "Missing or invalid authentication" })
@Controller("api/handlers")
export class HandlersController {
  public constructor(
    private readonly handlersService: HandlersService,
    private readonly commonService: CommonService,
  ) {}

  /**
   * Creates a new handler for the authenticated user.
   *
   * @param {CreateHandlerDto} createHandlerDto - Handler configuration data
   * @param {Request} request - Express request object
   * @returns The created handler
   * @throws {UnauthorizedException} If user is not authenticated
   */
  @ApiCreatedResponse({
    description: "Handler successfully created",
    type: OmitType(Handler, ["authToken"]),
  })
  @ApiHeader({
    description: "Session ID for authentication",
    example: "s123456789",
    name: "X-Session-Id",
    required: true,
  })
  @ApiOperation({
    description: dedent`
    Creates a new handler with the specified configuration.

    The handler will be associated with the authenticated user and will be assigned a unique ID and authentication token.
    The authentication token can be used to establish WebSocket connections to the handler.`,
    summary: "Create a new handler",
  })
  @Post()
  public async createOne(
    @Body() createHandlerDto: CreateHandlerDto,
    @Req() request: Request,
  ): Promise<Omit<Handler, "authToken" | "updateTimestamp">> {
    const userId = await this.commonService.getUserIdFromRequest(request);

    if (!isString(userId)) {
      throw new UnauthorizedException();
    }

    const { authToken, ...handler } = await this.handlersService.createOne(
      userId,
      createHandlerDto,
    );

    return handler;
  }

  /**
   * Retrieves the authentication token for a specific handler. This endpoint
   * requires authentication and only returns the token if the handler belongs
   * to the authenticated user.
   *
   * @param {string} id - The ID of the handler
   * @param {Request} request - Express request object
   * @returns The handler's auth token
   * @throws {NotFoundException} If handler is not found
   * @throws {UnauthorizedException} If user is not authenticated or not the
   *   owner
   */
  @ApiHeader({
    description: "Session ID for authentication",
    example: "s123456789",
    name: "X-Session-Id",
    required: true,
  })
  @ApiNotFoundResponse({ description: "Handler not found" })
  @ApiOkResponse({
    description: "Handler authentication token",
    type: PickType(Handler, ["authToken"]),
  })
  @ApiOperation({
    description:
      "Retrieves the authentication token for a specific handler. Only handlers belonging to the authenticated user can be accessed.",
    summary: "Get handler auth token",
  })
  @ApiParam({
    description: "The ID of the handler",
    example: "h1234567",
    name: "id",
  })
  @Get(":id/auth-token")
  public async getAuthToken(
    @Param("id") id: string,
    @Req() request: Request,
  ): Promise<Pick<Handler, "authToken">> {
    const userId = await this.commonService.getUserIdFromRequest(request);

    if (!isString(userId)) {
      throw new UnauthorizedException();
    }

    const handler = await this.handlersService.findOne(id);

    if (!handler) {
      throw new NotFoundException();
    }

    if (handler.userId !== userId) {
      throw new UnauthorizedException();
    }

    return { authToken: handler.authToken };
  }

  /**
   * Retrieves detailed information about a specific handler.
   *
   * @param {string} id - The ID of the handler to retrieve
   * @returns Handler details
   * @throws {NotFoundException} If handler is not found
   */
  @ApiNotFoundResponse({ description: "Handler not found" })
  @ApiOkResponse({
    description: "Handler details",
    type: OmitType(Handler, ["authToken"]),
  })
  @ApiOperation({
    description: "Retrieves detailed information about a specific handler.",
    summary: "Get handler details",
  })
  @ApiParam({
    description: "The ID of the handler to retrieve",
    example: "h1234567",
    name: "id",
  })
  @Get(":id")
  public async getHandler(
    @Param("id") id: string,
  ): Promise<Omit<Handler, "authToken" | "updateTimestamp">> {
    const handler = await this.handlersService.findOne(id);

    if (!handler) {
      throw new NotFoundException();
    }

    const { authToken, ...handlerDetails } = handler;

    return handlerDetails;
  }

  /**
   * Gets handlers based on various criteria.
   *
   * @param {SearchHandlerDto} searchDto - Search criteria
   * @returns Array of matching handlers
   */
  @ApiOkResponse({
    description: "List of handlers matching the search criteria",
    type: [OmitType(Handler, ["authToken"])],
  })
  @ApiOperation({
    description: dedent`
    Gets handlers based on various criteria including:
    - Text search across name and descriptions
    - Filter by online status
    - Pagination support with limit and offset`,
    summary: "Get handlers",
  })
  @Get()
  public async getHandlers(
    @Query() searchDto: SearchHandlerDto,
  ): Promise<Omit<Handler, "authToken" | "updateTimestamp">[]> {
    const handlers = await this.handlersService.search(searchDto);

    return handlers.map(({ authToken, ...handler }) => handler);
  }

  /**
   * Deletes a specific handler.
   *
   * @param {string} id - The ID of the handler to delete
   * @param {Request} request - Express request object
   * @throws {NotFoundException} If handler is not found
   * @throws {UnauthorizedException} If user is not authenticated
   */
  @ApiHeader({
    description: "Session ID for authentication",
    example: "s123456789",
    name: "X-Session-Id",
    required: true,
  })
  @ApiNoContentResponse({ description: "Handler successfully deleted" })
  @ApiNotFoundResponse({ description: "Handler not found" })
  @ApiOperation({
    description:
      "Deletes a specific handler. Only handlers belonging to the authenticated user can be deleted.",
    summary: "Delete handler",
  })
  @ApiParam({
    description: "The ID of the handler to delete",
    example: "h1234567",
    name: "id",
  })
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  public async remove(
    @Param("id") id: string,
    @Req() request: Request,
  ): Promise<void> {
    const userId = await this.commonService.getUserIdFromRequest(request);

    if (!isString(userId)) {
      throw new UnauthorizedException();
    }

    await this.handlersService.deleteOne(id);
  }

  /**
   * Updates the configuration of a specific handler.
   *
   * @param {string} id - The ID of the handler to update
   * @param {UpdateHandlerDto} updateHandlerDto - Updated handler configuration
   * @param {Request} request - Express request object
   * @returns The updated handler
   * @throws {NotFoundException} If handler is not found
   * @throws {UnauthorizedException} If user is not authenticated
   */
  @ApiHeader({
    description: "Session ID for authentication",
    example: "s123456789",
    name: "X-Session-Id",
    required: true,
  })
  @ApiNotFoundResponse({ description: "Handler not found" })
  @ApiOkResponse({
    description: "Handler successfully updated",
    type: OmitType(Handler, ["authToken"]),
  })
  @ApiOperation({
    description:
      "Updates the configuration of a specific handler. Only handlers belonging to the authenticated user can be updated.",
    summary: "Update handler",
  })
  @ApiParam({
    description: "The ID of the handler to update",
    example: "h1234567",
    name: "id",
  })
  @Put(":id")
  public async update(
    @Param("id") id: string,
    @Body() updateHandlerDto: UpdateHandlerDto,
    @Req() request: Request,
  ): Promise<Omit<Handler, "authToken" | "updateTimestamp">> {
    const userId = await this.commonService.getUserIdFromRequest(request);

    if (!isString(userId)) {
      throw new UnauthorizedException();
    }

    const { authToken, ...handler } = await this.handlersService.updateOne(
      id,
      updateHandlerDto,
    );

    return handler;
  }
}
