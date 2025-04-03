import { Injectable } from "@nestjs/common";
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
    private readonly streamRepository: Repository<Stream>,
  ) {}

  public async create(createStreamDto: CreateStreamDto): Promise<Stream> {
    const stream = new Stream();

    let id: string;

    do {
      id = randomatic("aA0", 8);
    } while ((await this.streamRepository.count({ where: { id } })) > 0);

    stream.id = id;

    stream.name = createStreamDto.name;

    stream.configuration = createStreamDto.configuration;

    stream.handlerId = createStreamDto.handlerId;

    stream.isActive = true;

    stream.createdAt = Date.now();

    stream.updatedAt = stream.createdAt;

    return this.streamRepository.save(stream);
  }

  public async findOne(id: string): Promise<Stream> {
    return this.streamRepository.findOne({ where: { id } });
  }

  public async remove(id: string): Promise<void> {
    await this.streamRepository.delete(id);
  }

  public async update(
    id: string,
    updateStreamDto: UpdateStreamDto,
  ): Promise<Stream> {
    await this.streamRepository.update(id, {
      ...updateStreamDto,
      updatedAt: Date.now(),
    });

    return this.streamRepository.findOne({ where: { id } });
  }
}
