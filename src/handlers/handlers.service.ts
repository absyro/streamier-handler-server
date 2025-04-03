import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import randomatic from "randomatic";
import { Repository } from "typeorm";

import { CreateHandlerDto } from "./dto/create-handler.dto";
import { UpdateHandlerDto } from "./dto/update-handler.dto";
import { Handler } from "./entities/handler.entity";

@Injectable()
export class HandlersService {
  public constructor(
    @InjectRepository(Handler)
    private readonly handlerRepository: Repository<Handler>,
  ) {}

  public async create(
    sessionId: string,
    createHandlerDto: CreateHandlerDto,
  ): Promise<Handler> {
    const ownerId = await this.validateOwner(sessionId),
      count = await this.handlerRepository.count({ where: { ownerId } });

    const maxHandlersPerUser = 10;

    if (count >= maxHandlersPerUser) {
      throw new Error(
        `Maximum number of handlers (${maxHandlersPerUser}) reached`,
      );
    }

    const handler = new Handler();

    let id: string;

    do {
      id = randomatic("aA0", 8);
    } while ((await this.handlerRepository.count({ where: { id } })) > 0);

    handler.id = id;

    handler.name = createHandlerDto.name;

    handler.shortDescription = createHandlerDto.shortDescription;

    handler.longDescription = createHandlerDto.longDescription;

    handler.iconId = createHandlerDto.iconId;

    handler.authToken = this.generateAuthToken();

    handler.ownerId = ownerId;

    handler.createdAt = Date.now();

    handler.updatedAt = handler.createdAt;

    return this.handlerRepository.save(handler);
  }

  public async findAll(sessionId: string): Promise<Handler[]> {
    const ownerId = await this.validateOwner(sessionId);

    return this.handlerRepository.find({ where: { ownerId } });
  }

  public async findByAuthToken(authToken: string): Promise<Handler> {
    return this.handlerRepository.findOne({ where: { authToken } });
  }

  public async findOne(sessionId: string, id: string): Promise<Handler> {
    const ownerId = await this.validateOwner(sessionId),
      handler = await this.handlerRepository.findOne({
        where: { id, ownerId },
      });

    if (!handler) {
      throw new NotFoundException("Handler not found");
    }

    return handler;
  }

  public async remove(sessionId: string, id: string): Promise<void> {
    const ownerId = await this.validateOwner(sessionId),
      result = await this.handlerRepository.delete({ id, ownerId });

    if (result.affected === 0) {
      throw new NotFoundException("Handler not found");
    }
  }

  public async update(
    sessionId: string,
    id: string,
    updateHandlerDto: UpdateHandlerDto,
  ): Promise<Handler> {
    const existing = await this.findOne(sessionId, id),
      ownerId = await this.validateOwner(sessionId),
      updated = {
        ...existing,
        ...updateHandlerDto,
        updatedAt: Date.now(),
      };

    return this.handlerRepository.save(updated);
  }

  public async validateOwner(sessionId: string): Promise<string> {
    /*
     * In a real app, you would validate the session and return the owner ID
     * This is a simplified version
     */
    return "user-id-from-session";
  }

  private generateAuthToken(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }
}
