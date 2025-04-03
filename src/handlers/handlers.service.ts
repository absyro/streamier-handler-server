import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Handler } from "./entities/handler.entity";
import { CreateHandlerDto } from "./dto/create-handler.dto";
import { UpdateHandlerDto } from "./dto/update-handler.dto";
import { appConfig } from "../config/configuration";
import * as Snowflake from "snowflake-id";

@Injectable()
export class HandlersService {
  private snowflake = new Snowflake();

  constructor(
    @InjectRepository(Handler)
    private readonly handlerRepository: Repository<Handler>,
  ) {}

  async validateOwner(sessionId: string): Promise<string> {
    // In a real app, you would validate the session and return the owner ID
    // This is a simplified version
    return "user-id-from-session";
  }

  async create(
    sessionId: string,
    createHandlerDto: CreateHandlerDto,
  ): Promise<Handler> {
    const ownerId = await this.validateOwner(sessionId);

    const count = await this.handlerRepository.count({ where: { ownerId } });
    if (count >= appConfig.maxHandlersPerUser) {
      throw new Error(
        `Maximum number of handlers (${appConfig.maxHandlersPerUser}) reached`,
      );
    }

    const handler = new Handler();
    handler.id = this.snowflake.generate();
    handler.name = createHandlerDto.name;
    handler.shortDescription = createHandlerDto.shortDescription;
    handler.longDescription = createHandlerDto.longDescription;
    handler.iconId = createHandlerDto.iconId;
    handler.accessToken = this.generateAccessToken();
    handler.ownerId = ownerId;
    handler.createdAt = Date.now();
    handler.updatedAt = handler.createdAt;

    return this.handlerRepository.save(handler);
  }

  async findAll(sessionId: string): Promise<Handler[]> {
    const ownerId = await this.validateOwner(sessionId);
    return this.handlerRepository.find({ where: { ownerId } });
  }

  async findOne(sessionId: string, id: string): Promise<Handler> {
    const ownerId = await this.validateOwner(sessionId);
    const handler = await this.handlerRepository.findOne({
      where: { id, ownerId },
    });
    if (!handler) {
      throw new NotFoundException("Handler not found");
    }
    return handler;
  }

  async update(
    sessionId: string,
    id: string,
    updateHandlerDto: UpdateHandlerDto,
  ): Promise<Handler> {
    const ownerId = await this.validateOwner(sessionId);
    const existing = await this.findOne(sessionId, id);

    const updated = {
      ...existing,
      ...updateHandlerDto,
      updatedAt: Date.now(),
    };

    return this.handlerRepository.save(updated);
  }

  async remove(sessionId: string, id: string): Promise<void> {
    const ownerId = await this.validateOwner(sessionId);
    const result = await this.handlerRepository.delete({ id, ownerId });
    if (result.affected === 0) {
      throw new NotFoundException("Handler not found");
    }
  }

  private generateAccessToken(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }
}
