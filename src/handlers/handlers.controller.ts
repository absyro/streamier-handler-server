import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from "@nestjs/common";

import { UserId } from "../common/decorators/user-id.decorator";
import { ActiveHandlerResponseDto } from "./dto/active-handler.dto";
import { CreateHandlerDto } from "./dto/create-handler.dto";
import { UpdateHandlerDto } from "./dto/update-handler.dto";
import { Handler } from "./entities/handler.entity";
import { HandlersService } from "./handlers.service";

@Controller("handlers")
export class HandlersController {
  public constructor(private readonly handlersService: HandlersService) {}

  @Post()
  public async create(
    @UserId() userId: string,
    @Body() createHandlerDto: CreateHandlerDto,
  ): Promise<Handler> {
    return this.handlersService.createOneForSessionId(
      sessionId,
      createHandlerDto,
    );
  }

  @Get()
  public async findAll(@UserId() userId: string): Promise<Handler[]> {
    return this.handlersService.findAllByUserId(sessionId);
  }

  @Get(":handlerId")
  public async findOne(
    @UserId() userId: string,
    @Param("handlerId") handlerId: string,
  ): Promise<Handler> {
    return this.handlersService.findOneByUserIdAndHandlerId(
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
    @UserId() userId: string,
    @Param("handlerId") handlerId: string,
  ): Promise<void> {
    return this.handlersService.deleteOneByUserIdAndHandlerId(
      sessionId,
      handlerId,
    );
  }

  @Put(":handlerId")
  public async update(
    @UserId() userId: string,
    @Param("handlerId") handlerId: string,
    @Body() updateHandlerDto: UpdateHandlerDto,
  ): Promise<Handler> {
    return this.handlersService.updateOneByUserIdAndHandlerId(
      sessionId,
      handlerId,
      updateHandlerDto,
    );
  }
}
