import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import randomatic from "randomatic";
import { DataSource, Repository } from "typeorm";

import { CreateHandlerDto } from "./dto/create-handler.dto";
import { UpdateHandlerDto } from "./dto/update-handler.dto";
import { Handler } from "./entities/handler.entity";

@Injectable()
export class HandlersService {
  public constructor(
    @InjectRepository(Handler)
    private readonly handlerRepository: Repository<Handler>,
    private readonly dataSource: DataSource,
  ) {}

  public async createOneForSessionId(
    sessionId: string,
    createHandlerDto: CreateHandlerDto,
  ): Promise<Handler> {
    const userId = await this.findUserIdBySessionId(sessionId);

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

  public async deleteOneBySessionIdAndHandlerId(
    sessionId: string,
    handlerId: string,
  ): Promise<void> {
    const userId = await this.findUserIdBySessionId(sessionId);

    const result = await this.handlerRepository.delete({
      id: handlerId,
      userId,
    });

    if (result.affected === 0) {
      throw new NotFoundException("Handler not found");
    }
  }

  public async findAllBySessionId(sessionId: string): Promise<Handler[]> {
    const userId = await this.findUserIdBySessionId(sessionId);

    return this.handlerRepository.find({ where: { userId } });
  }

  public async findOneByAuthToken(authToken: string): Promise<Handler> {
    return this.handlerRepository.findOne({ where: { authToken } });
  }

  public async findOneBySessionIdAndHandlerId(
    sessionId: string,
    handlerId: string,
  ): Promise<Handler> {
    const userId = await this.findUserIdBySessionId(sessionId);

    const handler = await this.handlerRepository.findOne({
      where: {
        id: handlerId,
        userId,
      },
    });

    return handler;
  }

  public async findUserIdBySessionId(sessionId: string): Promise<string> {
    const userId = await this.dataSource.query<string>(
      "SELECT user_id FROM sessions WHERE id = ?",
      [sessionId],
    );

    return userId;
  }

  public async updateOneBySessionIdAndHandlerId(
    sessionId: string,
    handlerId: string,
    updateHandlerDto: UpdateHandlerDto,
  ): Promise<Handler> {
    const existing = await this.findOneBySessionIdAndHandlerId(
      sessionId,
      handlerId,
    );

    const updated = { ...existing, ...updateHandlerDto };

    return this.handlerRepository.save(updated);
  }
}
