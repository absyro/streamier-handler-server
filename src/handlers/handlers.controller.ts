import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import randomatic from "randomatic";
import { Repository } from "typeorm";

import { UserId } from "../common/decorators/user-id.decorator";
import { CreateHandlerDto } from "./dto/create-handler.dto";
import { UpdateHandlerDto } from "./dto/update-handler.dto";
import { Handler } from "./entities/handler.entity";
import { HandlersService } from "./handlers.service";

@Controller("handlers")
export class HandlersController {
  public constructor(
    private readonly handlersService: HandlersService,
    @InjectRepository(Handler)
    private readonly handlerRepository: Repository<Handler>,
  ) {}

  @Post()
  public async createOne(
    @UserId() userId: string,
    @Body() createHandlerDto: CreateHandlerDto,
  ): Promise<Handler> {
    const count = await this.handlerRepository.count({ where: { userId } });

    const maxHandlersPerUser = 10;

    if (count >= maxHandlersPerUser) {
      throw new Error(
        `Maximum number of handlers (${maxHandlersPerUser}) reached`,
      );
    }

    const handler = new Handler();

    let id: string;

    let authToken: string;

    do {
      id = randomatic("Aa0!", 64);
    } while (await this.handlerRepository.exists({ where: { id } }));

    do {
      authToken = randomatic("Aa0!", 8);
    } while (await this.handlerRepository.exists({ where: { authToken } }));

    handler.id = id;

    handler.name = createHandlerDto.name;

    handler.shortDescription = createHandlerDto.shortDescription;

    handler.longDescription = createHandlerDto.longDescription;

    handler.iconId = createHandlerDto.iconId;

    handler.authToken = authToken;

    handler.userId = userId;

    return this.handlerRepository.save(handler);
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
