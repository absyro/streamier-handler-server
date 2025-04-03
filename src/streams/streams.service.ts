import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as Snowflake from "snowflake-id";
import { Repository } from "typeorm";

import { CreateStreamDto } from "./dto/create-stream.dto";
import { UpdateStreamDto } from "./dto/update-stream.dto";
import { Stream } from "./entities/stream.entity";

@Injectable()
export class StreamsService {
  private readonly snowflake = new Snowflake();

  constructor(
    @InjectRepository(Stream)
    private readonly streamRepository: Repository<Stream>,
  ) {}

  async create(createStreamDto: CreateStreamDto): Promise<Stream> {
    const stream = new Stream();

    stream.id = this.snowflake.generate();

    stream.name = createStreamDto.name;

    stream.configuration = createStreamDto.configuration;

    stream.handlerId = createStreamDto.handlerId;

    stream.isActive = true;

    stream.createdAt = Date.now();

    stream.updatedAt = stream.createdAt;

    return this.streamRepository.save(stream);
  }

  async findByHandlerId(handlerId: string): Promise<Stream[]> {
    return this.streamRepository.find({ where: { handlerId } });
  }

  async findOne(id: string): Promise<Stream> {
    return this.streamRepository.findOne({ where: { id } });
  }

  async remove(id: string): Promise<void> {
    await this.streamRepository.delete(id);
  }

  async update(id: string, updateStreamDto: UpdateStreamDto): Promise<Stream> {
    await this.streamRepository.update(id, {
      ...updateStreamDto,
      updatedAt: Date.now(),
    });

    return this.streamRepository.findOne({ where: { id } });
  }
}
