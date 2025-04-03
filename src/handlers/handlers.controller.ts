import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Put,
  Query,
} from "@nestjs/common";

import { ActiveHandlerResponseDto } from "./dto/active-handler.dto";
import { CreateHandlerDto } from "./dto/create-handler.dto";
import { UpdateHandlerDto } from "./dto/update-handler.dto";
import { Handler } from "./entities/handler.entity";
import { HandlersService } from "./handlers.service";

@Controller("api/handlers")
export class HandlersController {
  public constructor(private readonly handlersService: HandlersService) {}

  @Post()
  public async create(
    @Headers("x-session-id") sessionId: string,
    @Body() createHandlerDto: CreateHandlerDto,
  ): Promise<Handler> {
    return this.handlersService.createOneForSessionId(
      sessionId,
      createHandlerDto,
    );
  }

  @Get()
  public async findAll(
    @Headers("x-session-id") sessionId: string,
  ): Promise<Handler[]> {
    return this.handlersService.findAllBySessionId(sessionId);
  }

  @Get(":handlerId")
  public async findOne(
    @Headers("x-session-id") sessionId: string,
    @Param("handlerId") handlerId: string,
  ): Promise<Handler> {
    return this.handlersService.findOneBySessionIdAndHandlerId(
      sessionId,
      handlerId,
    );
  }

  @Get("active/list")
  public listActiveHandlers(
    @Query("owner_id") ownerId?: string,
    @Query("search") searchTerm?: string,
    @Query("limit") limit = "20",
    @Query("offset") offset = "0",
  ): {
    hasMore: boolean;
    items: ActiveHandlerResponseDto[];
    limit: number;
    offset: number;
    total: number;
  } {
    /*
     * Implementation would query active connections and handlers
     * Similar to the Go version but adapted for NestJS
     */
    return {
      hasMore: false,
      items: [],
      limit: Number.parseInt(limit, 10),
      offset: Number.parseInt(offset, 10),
      total: 0,
    };
  }

  @Delete(":handlerId")
  public async remove(
    @Headers("x-session-id") sessionId: string,
    @Param("handlerId") handlerId: string,
  ): Promise<void> {
    return this.handlersService.deleteOneBySessionIdAndHandlerId(
      sessionId,
      handlerId,
    );
  }

  @Put(":handlerId")
  public async update(
    @Headers("x-session-id") sessionId: string,
    @Param("handlerId") handlerId: string,
    @Body() updateHandlerDto: UpdateHandlerDto,
  ): Promise<Handler> {
    return this.handlersService.updateOneBySessionIdAndHandlerId(
      sessionId,
      handlerId,
      updateHandlerDto,
    );
  }
}
