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

  public async createOneByUserId(
    userId: string,
    createHandlerDto: CreateHandlerDto,
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

  public async deleteOneById(id: string): Promise<void> {
    const result = await this.handlerRepository.delete({ id });

    if (result.affected === 0) {
      throw new NotFoundException("Handler not found");
    }
  }

  public async findAllByUserId(userId: string): Promise<Handler[]> {
    return this.handlerRepository.find({ where: { userId } });
  }

  public async findOneByAuthToken(authToken: string): Promise<Handler> {
    return this.handlerRepository.findOne({ where: { authToken } });
  }

  public async findOneById(id: string): Promise<Handler> {
    return this.handlerRepository.findOne({ where: { id } });
  }

  public async updateOneById(
    id: string,
    updateHandlerDto: UpdateHandlerDto,
  ): Promise<Handler> {
    const existing = await this.findOneById(id);

    const updated = { ...existing, ...updateHandlerDto };

    return this.handlerRepository.save(updated);
  }
}
