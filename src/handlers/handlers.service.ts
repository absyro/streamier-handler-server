import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { isString } from "radash";
import randomatic from "randomatic";
import { In, Repository } from "typeorm";

import { CreateHandlerDto } from "./dto/create-handler.dto";
import { SearchHandlerDto } from "./dto/search-handler.dto";
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
    const count = await this.handlerRepository.count({ where: { userId } });

    const maxHandlersPerUser = 124;

    if (count >= maxHandlersPerUser) {
      throw new ForbiddenException(
        `You have reached the maximum limit of ${maxHandlersPerUser} handlers per user`,
      );
    }

    const handler = new Handler();

    let handlerId: string;

    let authToken: string;

    do {
      handlerId = randomatic("a0", 8);
    } while (await this.handlerRepository.exists({ where: { id: handlerId } }));

    do {
      authToken = randomatic("Aa0", 64);
    } while (await this.handlerRepository.exists({ where: { authToken } }));

    handler.id = handlerId;

    handler.name = createHandlerDto.name;

    handler.shortDescription = createHandlerDto.shortDescription;

    handler.longDescription = createHandlerDto.longDescription;

    handler.iconId = createHandlerDto.iconId;

    handler.authToken = authToken;

    handler.userId = userId;

    return this.handlerRepository.save(handler);
  }

  public async deleteOne(handlerId: string): Promise<void> {
    const result = await this.handlerRepository.delete({ id: handlerId });

    if (result.affected === 0) {
      throw new NotFoundException("Handler not found");
    }
  }

  public async exists(handlerId: string): Promise<boolean> {
    const count = await this.handlerRepository.count({
      where: { id: handlerId },
    });

    return count > 0;
  }

  public async findAll(userId: string): Promise<Handler[]> {
    return this.handlerRepository.find({ where: { userId } });
  }

  public async findAllUsingAuthTokens(
    authTokens: string[],
  ): Promise<Handler[]> {
    return this.handlerRepository.find({
      where: { authToken: In(authTokens) },
    });
  }

  public async findOne(handlerId: string): Promise<Handler | null> {
    return this.handlerRepository.findOne({ where: { id: handlerId } });
  }

  public async findOneUsingAuthToken(
    authToken: string,
  ): Promise<Handler | null> {
    return this.handlerRepository.findOne({ where: { authToken } });
  }

  public async search(searchDto: SearchHandlerDto): Promise<Handler[]> {
    const queryBuilder = this.handlerRepository.createQueryBuilder("handler");

    if (isString(searchDto.q)) {
      queryBuilder.where(
        "LOWER(handler.name) LIKE LOWER(:query) OR " +
          "LOWER(handler.shortDescription) LIKE LOWER(:query) OR " +
          "LOWER(handler.longDescription) LIKE LOWER(:query)",
        { query: `%${searchDto.q}%` },
      );
    }

    if (isString(searchDto.userId)) {
      queryBuilder.andWhere("handler.userId = :userId", {
        userId: searchDto.userId,
      });
    }

    if (isString(searchDto.isOnline)) {
      const isOnline = searchDto.isOnline === "true";

      queryBuilder.andWhere("handler.isOnline = :isOnline", { isOnline });
    }

    const offset = isString(searchDto.offset)
      ? parseInt(searchDto.offset, 10)
      : 0;

    const limit = isString(searchDto.limit)
      ? parseInt(searchDto.limit, 10)
      : 20;

    queryBuilder.skip(offset).take(limit);

    return queryBuilder.getMany();
  }

  public async setAllHandlersOffline(): Promise<void> {
    await this.handlerRepository.update({}, { isOnline: false });
  }

  public async setOnlineStatus(
    handlerId: string,
    isOnline: boolean,
  ): Promise<void> {
    const result = await this.handlerRepository.update(
      { id: handlerId },
      { isOnline },
    );

    if (result.affected === 0) {
      throw new NotFoundException("Handler not found");
    }
  }

  public async updateOne(
    handlerId: string,
    updateHandlerDto: UpdateHandlerDto,
  ): Promise<Handler> {
    const existing = await this.findOne(handlerId);

    if (!existing) {
      throw new NotFoundException("Handler not found");
    }

    const updated = { ...existing, ...updateHandlerDto };

    return this.handlerRepository.save(updated);
  }
}
