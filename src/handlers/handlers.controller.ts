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
} from "@nestjs/swagger";
import { isString } from "class-validator";
import { Request } from "express";
import { dedent } from "ts-dedent";

import { CommonService } from "../common/common.service";
import { CreateHandlerDto } from "./dto/create-handler.dto";
import { SearchHandlerDto } from "./dto/search-handler.dto";
import { UpdateHandlerDto } from "./dto/update-handler.dto";
import { Handler } from "./entities/handler.entity";
import { HandlersGateway } from "./handlers.gateway";
import { HandlersService } from "./handlers.service";

@ApiBadRequestResponse({ description: "Invalid request parameters or body" })
@ApiTags("Handlers")
@ApiUnauthorizedResponse({ description: "Missing or invalid authentication" })
@Controller("api/handlers")
export class HandlersController {
  public constructor(
    private readonly handlersService: HandlersService,
    private readonly handlersGateway: HandlersGateway,
    private readonly commonService: CommonService,
  ) {}

  @ApiCreatedResponse({
    description: "Handler successfully created",
    type: Handler,
  })
  @ApiHeader({
    description: "Session ID for authentication",
    example: "1234567890",
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
  ): Promise<Handler> {
    const userId = await this.commonService.getUserIdFromRequest(request);

    if (!isString(userId)) {
      throw new UnauthorizedException();
    }

    return this.handlersService.createOne(userId, createHandlerDto);
  }

  @ApiHeader({
    description: "Session ID for authentication",
    example: "1234567890",
    name: "X-Session-Id",
    required: true,
  })
  @ApiOkResponse({
    description: "List of all handlers for the user",
    type: [Handler],
  })
  @ApiOperation({
    description:
      "Retrieves a list of all handlers belonging to the authenticated user.",
    summary: "Get user's handlers",
  })
  @Get()
  public async findAll(@Req() request: Request): Promise<Handler[]> {
    const userId = await this.commonService.getUserIdFromRequest(request);

    if (!isString(userId)) {
      throw new UnauthorizedException();
    }

    return this.handlersService.findAll(userId);
  }

  @ApiOkResponse({
    description: "List of all active handlers",
    type: [Handler],
  })
  @ApiOperation({
    description:
      "Retrieves a list of all currently active handlers. This endpoint is publicly accessible and does not require authentication.",
    summary: "Get active handlers",
  })
  @Get("active/list")
  public async findAllActive(): Promise<
    Omit<Handler, "authToken" | "updateTimestamp">[]
  > {
    const { server } = this.handlersGateway;

    const sockets = await server.fetchSockets();

    const authTokens = sockets.map((socket) =>
      String(socket.handshake.auth.token),
    );

    const handlers =
      await this.handlersService.findAllUsingAuthTokens(authTokens);

    return handlers.map(({ authToken, ...handler }) => handler);
  }

  @ApiHeader({
    description: "Session ID for authentication",
    example: "1234567890",
    name: "X-Session-Id",
    required: true,
  })
  @ApiNotFoundResponse({ description: "Handler not found" })
  @ApiOkResponse({
    description: "Handler details",
    type: Handler,
  })
  @ApiOperation({
    description:
      "Retrieves detailed information about a specific handler. If the handler belongs to the authenticated user, the authentication token will be included in the response.",
    summary: "Get handler details",
  })
  @ApiParam({
    description: "The ID of the handler to retrieve",
    example: "h1234567",
    name: "id",
  })
  @Get(":id")
  public async findOne(
    @Param("id") id: string,
    @Req() request: Request,
  ): Promise<Omit<Handler, "authToken" | "updateTimestamp">> {
    const h = await this.handlersService.findOne(id);

    if (!h) {
      throw new NotFoundException();
    }

    const { authToken, ...handler } = h;

    const userId = await this.commonService.getUserIdFromRequest(request);

    return { ...handler, ...(handler.userId === userId && { authToken }) };
  }

  @ApiHeader({
    description: "Session ID for authentication",
    example: "1234567890",
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

  @ApiOkResponse({
    description: "List of handlers matching the search criteria",
    type: [Handler],
  })
  @ApiOperation({
    description: dedent`
    Searches for handlers based on various criteria including:
    - Text search across name, descriptions, and tags
    - Filter by specific tags
    - Filter by minimum/maximum number of tags
    - Pagination support with limit and offset`,
    summary: "Search handlers with filters",
  })
  @Get("search")
  public async search(
    @Query() searchDto: SearchHandlerDto,
  ): Promise<Handler[]> {
    return this.handlersService.search(searchDto);
  }

  @ApiHeader({
    description: "Session ID for authentication",
    example: "1234567890",
    name: "X-Session-Id",
    required: true,
  })
  @ApiNotFoundResponse({ description: "Handler not found" })
  @ApiOkResponse({
    description: "Handler successfully updated",
    type: Handler,
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
  ): Promise<Handler> {
    const userId = await this.commonService.getUserIdFromRequest(request);

    if (!isString(userId)) {
      throw new UnauthorizedException();
    }

    return this.handlersService.updateOne(id, updateHandlerDto);
  }
}
