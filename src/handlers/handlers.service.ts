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

  public async createOne(
    userId: string,
    createHandlerDto: CreateHandlerDto,
  ): Promise<Handler> {
    const count = await this.handlerRepository.count({
      where: {
        ownerId: userId,
      },
    });

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
      id = randomatic("a0", 8);
    } while (await this.handlerRepository.exists({ where: { id } }));

    do {
      authToken = randomatic("Aa0!", 64);
    } while (await this.handlerRepository.exists({ where: { authToken } }));

    handler.id = id;

    handler.name = createHandlerDto.name;

    handler.shortDescription = createHandlerDto.shortDescription;

    handler.longDescription = createHandlerDto.longDescription;

    handler.iconId = createHandlerDto.iconId;

    handler.authToken = authToken;

    handler.ownerId = userId;

    return this.handlerRepository.save(handler);
  }

  public async deleteOne(id: string): Promise<void> {
    const result = await this.handlerRepository.delete({ id });

    if (result.affected === 0) {
      throw new NotFoundException("Handler not found");
    }
  }

  public async findAll(userId: string): Promise<Handler[]> {
    return this.handlerRepository.find({ where: { ownerId: userId } });
  }

  public async findOne(id: string): Promise<Handler | null> {
    return this.handlerRepository.findOne({ where: { id } });
  }

  public async findOneUsingAuthToken(
    authToken: string,
  ): Promise<Handler | null> {
    return this.handlerRepository.findOne({ where: { authToken } });
  }

  public async updateOne(
    id: string,
    updateHandlerDto: UpdateHandlerDto,
  ): Promise<Handler> {
    const existing = await this.findOne(id);

    const updated = { ...existing, ...updateHandlerDto };

    return this.handlerRepository.save(updated);
  }
}
