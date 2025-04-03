import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  Headers,
} from "@nestjs/common";
import { HandlersService } from "./handlers.service";
import { CreateHandlerDto } from "./dto/create-handler.dto";
import { UpdateHandlerDto } from "./dto/update-handler.dto";
import { ActiveHandlerResponseDto } from "./dto/active-handler.dto";
import { Handler } from "./entities/handler.entity";

@Controller("api/handlers")
export class HandlersController {
  constructor(private readonly handlersService: HandlersService) {}

  @Post()
  async create(
    @Headers("x-session-id") sessionId: string,
    @Body() createHandlerDto: CreateHandlerDto,
  ): Promise<Handler> {
    return this.handlersService.create(sessionId, createHandlerDto);
  }

  @Get()
  async findAll(
    @Headers("x-session-id") sessionId: string,
  ): Promise<Handler[]> {
    return this.handlersService.findAll(sessionId);
  }

  @Get(":id")
  async findOne(
    @Headers("x-session-id") sessionId: string,
    @Param("id") id: string,
  ): Promise<Handler> {
    return this.handlersService.findOne(sessionId, id);
  }

  @Put(":id")
  async update(
    @Headers("x-session-id") sessionId: string,
    @Param("id") id: string,
    @Body() updateHandlerDto: UpdateHandlerDto,
  ): Promise<Handler> {
    return this.handlersService.update(sessionId, id, updateHandlerDto);
  }

  @Delete(":id")
  async remove(
    @Headers("x-session-id") sessionId: string,
    @Param("id") id: string,
  ): Promise<void> {
    return this.handlersService.remove(sessionId, id);
  }

  @Get("active/list")
  async listActiveHandlers(
    @Query("owner_id") ownerId?: string,
    @Query("search") searchTerm?: string,
    @Query("limit") limit = "20",
    @Query("offset") offset = "0",
  ): Promise<{
    items: ActiveHandlerResponseDto[];
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  }> {
    // Implementation would query active connections and handlers
    // Similar to the Go version but adapted for NestJS
    return {
      items: [],
      total: 0,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      has_more: false,
    };
  }
}
