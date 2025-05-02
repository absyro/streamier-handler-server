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
  ApiTags,
} from "@nestjs/swagger";
import { Request } from "express";
import { CommonService } from "src/common/common.service";

import { CreateHandlerDto } from "./dto/create-handler.dto";
import { UpdateHandlerDto } from "./dto/update-handler.dto";
import { Handler } from "./entities/handler.entity";
import { HandlersGateway } from "./handlers.gateway";
import { HandlersService } from "./handlers.service";

@ApiBadRequestResponse({ description: "Bad request" })
@ApiTags("Handlers")
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
    description: "The ID of the session",
    name: "x-session-id",
    required: true,
  })
  @ApiOperation({
    description: "Create a new handler",
    summary: "Create handler",
  })
  @Post()
  public async createOne(
    @Body() createHandlerDto: CreateHandlerDto,
    @Req() request: Request,
  ): Promise<Handler> {
    const userId = await this.commonService.getUserIdFromRequest(request);

    if (typeof userId !== "string") {
      throw new UnauthorizedException();
    }

    return this.handlersService.createOne(userId, createHandlerDto);
  }

  @ApiHeader({
    description: "The ID of the session",
    name: "x-session-id",
    required: true,
  })
  @ApiOkResponse({
    description: "List of all handlers for the user",
    type: [Handler],
  })
  @ApiOperation({
    description: "Get all handlers belonging to the current user",
    summary: "Get user's handlers",
  })
  @Get()
  public async findAll(@Req() request: Request): Promise<Handler[]> {
    const userId = await this.commonService.getUserIdFromRequest(request);

    if (typeof userId !== "string") {
      throw new UnauthorizedException();
    }

    return this.handlersService.findAll(userId);
  }

  @ApiOkResponse({
    description: "List of all active handlers",
    type: [Handler],
  })
  @ApiOperation({
    description: "Get all currently active handlers (available to all users)",
    summary: "Get active handlers",
  })
  @Get("active/list")
  public async findAllActive(): Promise<
    Omit<Handler, "authToken" | "updateTimestamp">[]
  > {
    const { server } = this.handlersGateway;

    const sockets = await server.fetchSockets();

    const authTokens = sockets.map(
      (socket) => socket.handshake.auth.token as string,
    );

    const handlers =
      await this.handlersService.findAllUsingAuthTokens(authTokens);

    return handlers.map(({ authToken, ...handler }) => handler);
  }

  @ApiHeader({
    description: "The ID of the session",
    name: "x-session-id",
    required: true,
  })
  @ApiNotFoundResponse({ description: "Handler not found" })
  @ApiOkResponse({
    description: "Handler details",
    type: Handler,
  })
  @ApiOperation({
    description: "Get details for a specific handler",
    summary: "Get handler details",
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
    description: "The ID of the session",
    name: "x-session-id",
    required: true,
  })
  @ApiNoContentResponse({ description: "Handler successfully deleted" })
  @ApiNotFoundResponse({ description: "Handler not found" })
  @ApiOperation({
    description: "Delete a specific handler",
    summary: "Delete handler",
  })
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  public async remove(
    @Param("id") id: string,
    @Req() request: Request,
  ): Promise<void> {
    const userId = await this.commonService.getUserIdFromRequest(request);

    if (typeof userId !== "string") {
      throw new UnauthorizedException();
    }

    await this.handlersService.deleteOne(id);
  }

  @ApiHeader({
    description: "The ID of the session",
    name: "x-session-id",
    required: true,
  })
  @ApiNotFoundResponse({ description: "Handler not found" })
  @ApiOkResponse({
    description: "Handler successfully updated",
    type: Handler,
  })
  @ApiOperation({
    description: "Update a specific handler",
    summary: "Update handler",
  })
  @Put(":id")
  public async update(
    @Param("id") id: string,
    @Body() updateHandlerDto: UpdateHandlerDto,
    @Req() request: Request,
  ): Promise<Handler> {
    const userId = await this.commonService.getUserIdFromRequest(request);

    if (typeof userId !== "string") {
      throw new UnauthorizedException();
    }

    return this.handlersService.updateOne(id, updateHandlerDto);
  }
}
