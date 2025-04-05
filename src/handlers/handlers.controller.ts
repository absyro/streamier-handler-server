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
import { Request } from "express";
import { CommonService } from "src/common/common.service";

import { CreateHandlerDto } from "./dto/create-handler.dto";
import { UpdateHandlerDto } from "./dto/update-handler.dto";
import { Handler } from "./entities/handler.entity";
import { HandlersGateway } from "./handlers.gateway";
import { HandlersService } from "./handlers.service";

@Controller("api/handlers")
export class HandlersController {
  public constructor(
    private readonly handlersService: HandlersService,
    private readonly handlersGateway: HandlersGateway,
    private readonly commonService: CommonService,
  ) {}

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

  @Get()
  public async findAll(@Req() request: Request): Promise<Handler[]> {
    const userId = await this.commonService.getUserIdFromRequest(request);

    if (typeof userId !== "string") {
      throw new UnauthorizedException();
    }

    return this.handlersService.findAll(userId);
  }

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

    return { ...handler, ...(handler.ownerId === userId && { authToken }) };
  }

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
