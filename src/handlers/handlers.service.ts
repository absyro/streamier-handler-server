import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { isEmpty, isNumber, isString } from "radash";
import randomatic from "randomatic";
import { In, Repository } from "typeorm";

import { CreateHandlerDto } from "./dto/create-handler.dto";
import { SearchHandlerDto } from "./dto/search-handler.dto";
import { UpdateHandlerDto } from "./dto/update-handler.dto";
import { Handler } from "./entities/handler.entity";

/**
 * Service for managing stream handlers.
 *
 * Provides functionality for:
 *
 * - Creating new handlers
 * - Updating existing handlers
 * - Deleting handlers
 * - Finding handlers by various criteria
 * - Searching handlers with advanced filters
 *
 * @class HandlersService
 */
@Injectable()
export class HandlersService {
  public constructor(
    @InjectRepository(Handler)
    private readonly handlerRepository: Repository<Handler>,
  ) {}

  /**
   * Creates a new handler for a user.
   *
   * @param {string} userId - The ID of the user creating the handler
   * @param {CreateHandlerDto} createHandlerDto - Data for creating the handler
   * @returns The created handler
   * @throws {BadRequestException} If user has reached maximum handlers limit
   */
  public async createOne(
    userId: string,
    createHandlerDto: CreateHandlerDto,
  ): Promise<Handler> {
    const count = await this.handlerRepository.count({ where: { userId } });

    const maxHandlersPerUser = 10;

    if (count >= maxHandlersPerUser) {
      throw new BadRequestException(
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
      authToken = randomatic("Aa0", 64);
    } while (await this.handlerRepository.exists({ where: { authToken } }));

    handler.id = id;

    handler.name = createHandlerDto.name;

    handler.shortDescription = createHandlerDto.shortDescription;

    handler.longDescription = createHandlerDto.longDescription;

    handler.iconId = createHandlerDto.iconId;

    handler.tags = createHandlerDto.tags;

    handler.authToken = authToken;

    handler.userId = userId;

    return this.handlerRepository.save(handler);
  }

  /**
   * Deletes a handler by its ID.
   *
   * @param {string} id - The ID of the handler to delete
   * @throws {NotFoundException} If handler is not found
   */
  public async deleteOne(id: string): Promise<void> {
    const result = await this.handlerRepository.delete({ id });

    if (result.affected === 0) {
      throw new NotFoundException("Handler not found");
    }
  }

  /**
   * Finds all handlers belonging to a user.
   *
   * @param {string} userId - The ID of the user
   * @returns Array of handlers
   */
  public async findAll(userId: string): Promise<Handler[]> {
    return this.handlerRepository.find({ where: { userId } });
  }

  /**
   * Finds handlers by their authentication tokens.
   *
   * @param {string[]} authTokens - Array of authentication tokens
   * @returns Array of matching handlers
   */
  public async findAllUsingAuthTokens(
    authTokens: string[],
  ): Promise<Handler[]> {
    return this.handlerRepository.find({
      where: { authToken: In(authTokens) },
    });
  }

  /**
   * Finds a handler by its ID.
   *
   * @param {string} id - The ID of the handler
   * @returns The found handler or null
   */
  public async findOne(id: string): Promise<Handler | null> {
    return this.handlerRepository.findOne({ where: { id } });
  }

  /**
   * Finds a handler by its authentication token.
   *
   * @param {string} authToken - The authentication token
   * @returns The found handler or null
   */
  public async findOneUsingAuthToken(
    authToken: string,
  ): Promise<Handler | null> {
    return this.handlerRepository.findOne({ where: { authToken } });
  }

  /**
   * Searches for handlers using various criteria.
   *
   * Supports searching by:
   *
   * - Text query (name, descriptions, tags)
   * - Tags
   * - Minimum/maximum number of tags
   * - Pagination (offset/limit)
   *
   * @param {SearchHandlerDto} searchDto - Search criteria
   * @returns Array of matching handlers
   */
  public async search(searchDto: SearchHandlerDto): Promise<Handler[]> {
    const queryBuilder = this.handlerRepository.createQueryBuilder("handler");

    if (isString(searchDto.q)) {
      queryBuilder.where(
        "LOWER(handler.name) LIKE LOWER(:query) OR " +
          "LOWER(handler.shortDescription) LIKE LOWER(:query) OR " +
          "LOWER(handler.longDescription) LIKE LOWER(:query) OR " +
          "LOWER(handler.tags) LIKE LOWER(:query)",
        { query: `%${searchDto.q}%` },
      );
    }

    if (isString(searchDto.userId)) {
      queryBuilder.andWhere("handler.userId = :userId", {
        userId: searchDto.userId,
      });
    }

    if (searchDto.tags && !isEmpty(searchDto.tags)) {
      queryBuilder.andWhere("handler.tags && :tags", { tags: searchDto.tags });
    }

    if (isNumber(searchDto.minTags)) {
      queryBuilder.andWhere("array_length(handler.tags, 1) >= :minTags", {
        minTags: searchDto.minTags,
      });
    }

    if (isNumber(searchDto.maxTags)) {
      queryBuilder.andWhere("array_length(handler.tags, 1) <= :maxTags", {
        maxTags: searchDto.maxTags,
      });
    }

    queryBuilder.skip(searchDto.offset ?? 0).take(searchDto.limit ?? 20);

    return queryBuilder.getMany();
  }

  /**
   * Sets all handlers to offline status.
   *
   * This method should be called when the server starts to ensure all handlers
   * start in an offline state until they reconnect.
   */
  public async setAllHandlersOffline(): Promise<void> {
    await this.handlerRepository.update({}, { isOnline: false });
  }

  /**
   * Sets the online status of a handler.
   *
   * @param {string} id - The ID of the handler
   * @param {boolean} isOnline - The new online status
   * @throws {NotFoundException} If handler is not found
   */
  public async setOnlineStatus(id: string, isOnline: boolean): Promise<void> {
    const result = await this.handlerRepository.update({ id }, { isOnline });

    if (result.affected === 0) {
      throw new NotFoundException("Handler not found");
    }
  }

  /**
   * Updates an existing handler.
   *
   * @param {string} id - The ID of the handler to update
   * @param {UpdateHandlerDto} updateHandlerDto - Data to update
   * @returns The updated handler
   */
  public async updateOne(
    id: string,
    updateHandlerDto: UpdateHandlerDto,
  ): Promise<Handler> {
    const existing = await this.findOne(id);

    const updated = { ...existing, ...updateHandlerDto };

    return this.handlerRepository.save(updated);
  }
}
