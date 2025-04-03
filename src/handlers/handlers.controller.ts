import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UnauthorizedException,
} from "@nestjs/common";
import { DataSource } from "typeorm";

import { UserId } from "../common/decorators/user-id.decorator";
import { ActiveHandlerResponseDto } from "./dto/active-handler.dto";
import { CreateHandlerDto } from "./dto/create-handler.dto";
import { UpdateHandlerDto } from "./dto/update-handler.dto";
import { Handler } from "./entities/handler.entity";
import { HandlersService } from "./handlers.service";

@Controller("handlers")
export class HandlersController {
  public constructor(
    private readonly handlersService: HandlersService,
    private readonly dataSource: DataSource,
  ) {}

  @Post()
  public async createOne(
    @UserId() userId: string,
    @Body() createHandlerDto: CreateHandlerDto,
  ): Promise<Handler> {
    return this.handlersService.createOne(userId, createHandlerDto);
  }

  @Get()
  public async findAll(@UserId() userId: string): Promise<Handler[]> {
    return this.handlersService.findAll(userId);
  }

  @Get(":id")
  public async findOne(
    @UserId() userId: string,
    @Param("id") id: string,
  ): Promise<Omit<Handler, "updateTimestamp">> {
    const { authToken, ...handler } = await this.handlersService.findOne(id);

    return { ...handler, ...(handler.userId === userId && { authToken }) };
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

  @Delete(":id")
  public async remove(
    @UserId() userId: string,
    @Param("id") id: string,
  ): Promise<void> {
    const [handler] = await this.dataSource.query<{ user_id: string }[]>(
      "SELECT user_id FROM handlers WHERE id = ?",
      [id],
    );

    if (handler.user_id !== userId) {
      throw new UnauthorizedException();
    }

    return this.handlersService.deleteOne(id);
  }

  @Put(":id")
  public async update(
    @UserId() userId: string,
    @Param("id") id: string,
    @Body() updateHandlerDto: UpdateHandlerDto,
  ): Promise<Handler> {
    const [handler] = await this.dataSource.query<{ user_id: string }[]>(
      "SELECT user_id FROM handlers WHERE id = ?",
      [id],
    );

    if (handler.user_id !== userId) {
      throw new UnauthorizedException();
    }

    return this.handlersService.updateOne(id, updateHandlerDto);
  }
}
