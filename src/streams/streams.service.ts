import {
  BadGatewayException,
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { validate } from "nestjs-zod";
import { pick } from "radash";
import randomatic from "randomatic";
import { FindOneOptions, Repository } from "typeorm";
import { z } from "zod";

import { CommonService } from "@/common/common.service";
import { HandlersService } from "@/handlers/handlers.service";

import { CreateStreamDto } from "./dto/create-stream.dto";
import { SearchStreamDto } from "./dto/search-stream.dto";
import { UpdateStreamDto } from "./dto/update-stream.dto";
import { Stream } from "./entities/stream.entity";
import { StreamSchema } from "./schemas/stream.schema";

@Injectable()
export class StreamsService {
  public constructor(
    @InjectRepository(Stream)
    private readonly streamsRepository: Repository<Stream>,
    private readonly commonService: CommonService,
    private readonly handlersService: HandlersService,
  ) {}

  public async createOne(
    userId: string,
    createStreamDto: CreateStreamDto,
  ): Promise<Stream> {
    const totalStreams = await this.streamsRepository.count({
      where: { userId },
    });

    const maxStreamsPerUser = 100;

    if (totalStreams >= maxStreamsPerUser) {
      throw new ForbiddenException(
        `You have reached the maximum limit of ${maxStreamsPerUser} streams per user`,
      );
    }

    await this.handlersService.emitToHandler(
      createStreamDto.handlerId,
      "validate_stream_configuration",
      createStreamDto.configuration,
    );

    const stream = new Stream();

    let id: string;

    do {
      id = randomatic("a0", 8);
    } while (await this.exists(id));

    stream.id = id;

    stream.name = createStreamDto.name;

    stream.configuration = createStreamDto.configuration;

    stream.handlerId = createStreamDto.handlerId;

    stream.isActive = true;

    stream.nodes = [];

    stream.permissions = {
      read: {
        all: [
          "configuration",
          "createdAt",
          "handlerId",
          "id",
          "longDescription",
          "name",
          "shortDescription",
          "userId",
        ],
        roles: {},
        teams: {},
        users: {},
      },
      write: {
        all: [],
        roles: {},
        teams: {},
        users: {},
      },
    };

    stream.userId = userId;

    stream.variables = {};

    return this.streamsRepository.save(stream);
  }

  public async deleteOne(streamId: string, userId: string): Promise<void> {
    const result = await this.streamsRepository.delete({
      id: streamId,
      userId,
    });

    if (result.affected === 0) {
      throw new NotFoundException("Stream not found");
    }
  }

  public async exists(streamId: string): Promise<boolean> {
    return this.streamsRepository.exists({ where: { id: streamId } });
  }

  public async findOne(
    streamId: string,
    options?: FindOneOptions<Stream>,
  ): Promise<Stream> {
    const stream = await this.streamsRepository.findOne({
      where: { id: streamId },
      ...options,
    });

    if (!stream) {
      throw new NotFoundException("Stream not found");
    }

    return stream;
  }

  public getPermittedStream(
    stream: Stream,
    userId: null | string,
  ): Partial<Stream> {
    const permittedFields = this._getStreamPermittedFields(
      stream,
      "read",
      userId,
    );

    const permittedStream = Object.fromEntries(
      permittedFields.map((field) => [field, stream[field]]),
    );

    return permittedStream;
  }

  public async getStreamConfigurationSchema(
    handlerId: string,
  ): Promise<Record<string, unknown>> {
    const response = await this.handlersService.emitToHandler(
      handlerId,
      "get_stream_configuration_schema",
    );

    const { schema } = validate(
      response,
      z.object({ schema: z.record(z.unknown()) }),
      (zodError) => new BadGatewayException(zodError),
    );

    return schema;
  }

  public async search(searchStreamDto: SearchStreamDto): Promise<Stream[]> {
    const queryBuilder = this.streamsRepository.createQueryBuilder("stream");

    if (searchStreamDto.q !== undefined) {
      queryBuilder.andWhere(
        "LOWER(stream.name) LIKE LOWER(:query) OR " +
          "LOWER(stream.shortDescription) LIKE LOWER(:query) OR " +
          "LOWER(stream.longDescription) LIKE LOWER(:query)",
        { query: `%${searchStreamDto.q}%` },
      );
    }

    if (searchStreamDto.userId !== undefined) {
      queryBuilder.andWhere("stream.userId = :userId", {
        userId: searchStreamDto.userId,
      });
    }

    if (searchStreamDto.handlerId !== undefined) {
      queryBuilder.andWhere("stream.handlerId = :handlerId", {
        handlerId: searchStreamDto.handlerId,
      });
    }

    if (searchStreamDto.isActive !== undefined) {
      const isActive = searchStreamDto.isActive === "true";

      queryBuilder.andWhere("stream.isActive = :isActive", { isActive });
    }

    if (searchStreamDto.createdDaysAgo !== undefined) {
      const days = parseInt(searchStreamDto.createdDaysAgo, 10);

      const date = new Date();

      date.setDate(date.getDate() - days);

      queryBuilder.andWhere("stream.createdAt >= :createdDate", {
        createdDate: date.toISOString(),
      });
    }

    if (searchStreamDto.updatedDaysAgo !== undefined) {
      const days = parseInt(searchStreamDto.updatedDaysAgo, 10);

      const date = new Date();

      date.setDate(date.getDate() - days);

      queryBuilder.andWhere("stream.updatedAt >= :updatedDate", {
        updatedDate: date.toISOString(),
      });
    }

    const offset =
      searchStreamDto.offset === undefined
        ? 0
        : parseInt(searchStreamDto.offset, 10);

    const limit =
      searchStreamDto.limit === undefined
        ? 20
        : parseInt(searchStreamDto.limit, 10);

    queryBuilder.skip(offset).take(limit);

    const streams = await queryBuilder.getMany();

    return streams;
  }

  public async updateOne(
    streamId: string,
    userId: null | string,
    updateStreamDto: UpdateStreamDto,
  ): Promise<Stream> {
    const stream = await this.findOne(streamId);

    const permittedFields = this._getStreamPermittedFields(
      stream,
      "write",
      userId,
    ) as (keyof UpdateStreamDto)[];

    const permittedStreamUpdate = Object.fromEntries(
      permittedFields.map((field) => [field, updateStreamDto[field]]),
    ) as UpdateStreamDto;

    if (permittedStreamUpdate.configuration) {
      await this.handlersService.emitToHandler(
        stream.handlerId,
        "validate_stream_configuration",
        permittedStreamUpdate.configuration,
      );
    }

    if (permittedStreamUpdate.permissions) {
      {
        const permittedUserIds = new Set<string>();

        Object.keys(permittedStreamUpdate.permissions.read.users).forEach(
          (permittedUserId) => permittedUserIds.add(permittedUserId),
        );

        Object.keys(permittedStreamUpdate.permissions.write.users).forEach(
          (permittedUserId) => permittedUserIds.add(permittedUserId),
        );

        for (const permittedUserId of permittedUserIds) {
          const doesUserExist =
            await this.commonService.doesUserExist(permittedUserId);

          if (!doesUserExist) {
            throw new BadRequestException(
              `User with ID ${permittedUserId} does not exist`,
            );
          }
        }
      }

      {
        const permittedTeamIds = new Set<string>();

        Object.keys(permittedStreamUpdate.permissions.read.teams).forEach(
          (permittedTeamId) => permittedTeamIds.add(permittedTeamId),
        );

        Object.keys(permittedStreamUpdate.permissions.write.users).forEach(
          (permittedTeamId) => permittedTeamIds.add(permittedTeamId),
        );

        if (permittedTeamIds.size > 0) {
          throw new BadRequestException("Teams are not supported yet");
        }
      }

      {
        const permittedRoles = new Set<string>();

        Object.keys(permittedStreamUpdate.permissions.read.roles).forEach(
          (permittedRole) => permittedRoles.add(permittedRole),
        );

        Object.keys(permittedStreamUpdate.permissions.write.roles).forEach(
          (permittedRole) => permittedRoles.add(permittedRole),
        );

        for (const permittedRole of permittedRoles) {
          if (!(permittedRole in stream.roles)) {
            throw new BadRequestException(
              `Role "${permittedRole}" does not exist in this stream`,
            );
          }
        }
      }
    }

    if (permittedStreamUpdate.roles) {
      const permittedUserIds = new Set<string>();

      const permittedTeamIds = new Set<string>();

      Object.values(permittedStreamUpdate.roles).forEach((role) => {
        role.users.forEach((permittedUserId) =>
          permittedUserIds.add(permittedUserId),
        );

        role.teams.forEach((permittedTeamId) =>
          permittedTeamIds.add(permittedTeamId),
        );
      });

      for (const permittedUserId of permittedUserIds) {
        const doesUserExist =
          await this.commonService.doesUserExist(permittedUserId);

        if (!doesUserExist) {
          throw new BadRequestException(
            `User with ID ${permittedUserId} does not exist`,
          );
        }
      }

      if (permittedTeamIds.size > 0) {
        throw new BadRequestException("Teams are not supported yet");
      }
    }

    const updatedStream = await this.streamsRepository.save({
      ...stream,
      ...permittedStreamUpdate,
    });

    const monitoredFieldsSet = new Set([
      "configuration",
      "id",
      "nodes",
      "variables",
    ]);

    const hasMonitoredFieldUpdate = Object.keys(permittedStreamUpdate).some(
      (field) => monitoredFieldsSet.has(field),
    );

    if (hasMonitoredFieldUpdate) {
      if (updatedStream.isActive) {
        await this.handlersService.emitToHandler(
          updatedStream.handlerId,
          "start_stream",
          pick(updatedStream, ["configuration", "id", "nodes", "variables"]),
        );
      } else {
        await this.handlersService.emitToHandler(
          updatedStream.handlerId,
          "stop_stream",
          {
            streamId: updatedStream.id,
          },
        );
      }
    }

    return updatedStream;
  }

  private _getStreamPermittedFields(
    stream: Stream,
    permission: "read" | "write",
    userId: null | string,
  ): (keyof StreamSchema)[] {
    const fields = Object.keys(stream) as (keyof StreamSchema)[];

    if (stream.userId === userId) {
      return fields;
    }

    const userRoles =
      userId === null
        ? []
        : Object.entries(stream.roles)
            .filter(([_, { users }]) => users.includes(userId))
            .map(([role]) => role);

    const { all, roles, users } = stream.permissions[permission];

    const permittedFields = fields.filter((field) => {
      if (all.includes(field)) {
        return true;
      }

      if (userId !== null && users[userId].includes(field)) {
        return true;
      }

      if (userRoles.some((role) => roles[role].includes(field))) {
        return true;
      }

      return false;
    });

    return permittedFields;
  }
}
