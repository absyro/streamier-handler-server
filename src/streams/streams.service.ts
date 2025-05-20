import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import randomatic from "randomatic";
import { Repository } from "typeorm";

import { CreateStreamDto } from "./dto/create-stream.dto";
import { UpdateStreamDto } from "./dto/update-stream.dto";
import { Stream } from "./entities/stream.entity";

@Injectable()
export class StreamsService {
  public constructor(
    @InjectRepository(Stream)
    private readonly streamsRepository: Repository<Stream>,
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

    stream.name = createStreamDto.name;

    stream.nodes = [];

    stream.permissions = {
      read: {
        all: [],
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

    stream.signature = randomatic("Aa0", 32);

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

  public async findOne(streamId: string): Promise<Stream> {
    const stream = await this.streamsRepository.findOne({
      where: { id: streamId },
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
    );

    return this.streamsRepository.save({ ...stream, ...permittedStreamUpdate });
  }

  private _getStreamPermittedFields(
    stream: Stream,
    permission: "read" | "write",
    userId: null | string,
  ): (keyof Stream)[] {
    const fields = Object.keys(stream) as (keyof Stream)[];

    if (stream.userId === userId) {
      return fields;
    }

    const userRoles =
      userId === null
        ? []
        : Object.entries(stream.roles)
            .filter(([_, { users }]) => users.includes(userId))
            .map(([role]) => role);

    const {
      all,
      roles,
      users,
    }: {
      all: string[];
      roles: Record<string, string[] | undefined>;
      users: Record<string, string[] | undefined>;
    } = stream.permissions[permission];

    const permittedFields = fields.filter((field) => {
      if (all.includes(field)) {
        return true;
      }

      if (userId !== null && users[userId]?.includes(field) === true) {
        return true;
      }

      if (userRoles.some((role) => roles[role]?.includes(field) === true)) {
        return true;
      }

      return false;
    });

    return permittedFields;
  }
}
