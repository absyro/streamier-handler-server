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
  ValidationPipe,
} from "@nestjs/common";
import { Request } from "express";
import { CommonService } from "src/common/common.service";

import { CreateHandlerDto } from "./dto/create-handler.dto";
import { UpdateHandlerDto } from "./dto/update-handler.dto";
import { Handler } from "./entities/handler.entity";
import { HandlersService } from "./handlers.service";

@Controller("api/handlers")
export class HandlersController {
  public constructor(
    private readonly handlersService: HandlersService,
    private readonly commonService: CommonService,
  ) {}

  @Post()
  public async createOne(
    @Body(new ValidationPipe()) createHandlerDto: CreateHandlerDto,
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
    @Body(new ValidationPipe()) updateHandlerDto: UpdateHandlerDto,
    @Req() request: Request,
  ): Promise<Handler> {
    const userId = await this.commonService.getUserIdFromRequest(request);

    if (typeof userId !== "string") {
      throw new UnauthorizedException();
    }

    return this.handlersService.updateOne(id, updateHandlerDto);
  }
}
