import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import randomatic from "randomatic";
import { FindOneOptions, Repository } from "typeorm";

import { CreateHandlerDto } from "./dto/create-handler.dto";
import { SearchHandlerDto } from "./dto/search-handler.dto";
import { UpdateHandlerDto } from "./dto/update-handler.dto";
import { Handler } from "./entities/handler.entity";

@Injectable()
export class HandlersService {
  public constructor(
    @InjectRepository(Handler)
    private readonly handlersRepository: Repository<Handler>,
  ) {}

  public async createOne(
    userId: string,
    createHandlerDto: CreateHandlerDto,
  ): Promise<Handler> {
    const totalHandlers = await this.handlersRepository.count({
      where: { userId },
    });

    const maxHandlersPerUser = 100;

    if (totalHandlers >= maxHandlersPerUser) {
      throw new ForbiddenException(
        `You have reached the maximum limit of ${maxHandlersPerUser} handlers per user`,
      );
    }

    const handler = new Handler();

    let id: string;

    do {
      id = randomatic("a0", 8);
    } while (await this.exists(id));

    handler.id = id;

    handler.name = createHandlerDto.name;

    handler.authToken = await this._generateAuthToken();

    handler.userId = userId;

    handler.isActive = true;

    handler.isSearchable = true;

    return this.handlersRepository.save(handler);
  }

  public async deleteOne(handlerId: string): Promise<void> {
    const result = await this.handlersRepository.delete({ id: handlerId });

    if (result.affected === 0) {
      throw new NotFoundException("Handler not found");
    }
  }

  public async exists(handlerId: string): Promise<boolean> {
    return this.handlersRepository.exists({ where: { id: handlerId } });
  }

  public async findOne(
    handlerId: string,
    options?: FindOneOptions<Handler>,
  ): Promise<Handler> {
    const handler = await this.handlersRepository.findOne({
      where: { id: handlerId },
      ...options,
    });

    if (!handler) {
      throw new NotFoundException("Handler not found");
    }

    return handler;
  }

  public async findOneUsingAuthToken(
    authToken: string,
  ): Promise<Handler | null> {
    return this.handlersRepository.findOne({ where: { authToken } });
  }

  public async regenerateAuthToken(handlerId: string): Promise<Handler> {
    const handler = await this.findOne(handlerId);

    handler.authToken = await this._generateAuthToken();

    return this.handlersRepository.save(handler);
  }

  public async search(searchHandlerDto: SearchHandlerDto): Promise<Handler[]> {
    const queryBuilder = this.handlersRepository.createQueryBuilder("handler");

    queryBuilder.where("handler.is_searchable = true");

    if (searchHandlerDto.q !== undefined) {
      queryBuilder.andWhere(
        "LOWER(handler.name) LIKE LOWER(:query) OR " +
          "LOWER(handler.shortDescription) LIKE LOWER(:query) OR " +
          "LOWER(handler.longDescription) LIKE LOWER(:query)",
        { query: `%${searchHandlerDto.q}%` },
      );
    }

    if (searchHandlerDto.userId !== undefined) {
      queryBuilder.andWhere("handler.userId = :userId", {
        userId: searchHandlerDto.userId,
      });
    }

    if (searchHandlerDto.isActive !== undefined) {
      const isActive = searchHandlerDto.isActive === "true";

      queryBuilder.andWhere("handler.isActive = :isActive", { isActive });
    }

    const offset = searchHandlerDto.offset
      ? parseInt(searchHandlerDto.offset, 10)
      : 0;

    const limit = searchHandlerDto.limit
      ? parseInt(searchHandlerDto.limit, 10)
      : 20;

    queryBuilder.skip(offset).take(limit);

    const handlers = await queryBuilder.getMany();

    return handlers;
  }

  public async setAllHandlersOffline(): Promise<void> {
    await this.handlersRepository
      .createQueryBuilder()
      .update()
      .set({ isActive: false })
      .execute();
  }

  public async updateOne(
    handlerId: string,
    updateHandlerDto: UpdateHandlerDto,
  ): Promise<Handler> {
    const handler = await this.findOne(handlerId);

    return this.handlersRepository.save({ ...handler, ...updateHandlerDto });
  }

  private async _generateAuthToken(): Promise<string> {
    let authToken: string;

    do {
      authToken = randomatic("Aa0", 64);
    } while (await this.handlersRepository.exists({ where: { authToken } }));

    return authToken;
  }
}
