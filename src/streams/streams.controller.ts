import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Put,
} from "@nestjs/common";

import { CreateStreamDto } from "./dto/create-stream.dto";
import { UpdateStreamDto } from "./dto/update-stream.dto";
import { Stream } from "./entities/stream.entity";
import { StreamsService } from "./streams.service";

@Controller("api/streams")
export class StreamsController {
  public constructor(private readonly streamsService: StreamsService) {}

  @Post()
  public async create(
    @Headers("x-session-id") sessionId: string,
    @Body() createStreamDto: CreateStreamDto,
  ): Promise<Stream> {
    return this.streamsService.create(createStreamDto);
  }

  @Get(":id")
  public async findOne(
    @Headers("x-session-id") sessionId: string,
    @Param("id") id: string,
  ): Promise<Stream> {
    return this.streamsService.findOne(id);
  }

  @Delete(":id")
  public async remove(
    @Headers("x-session-id") sessionId: string,
    @Param("id") id: string,
  ): Promise<void> {
    return this.streamsService.remove(id);
  }

  @Put(":id")
  public async update(
    @Headers("x-session-id") sessionId: string,
    @Param("id") id: string,
    @Body() updateStreamDto: UpdateStreamDto,
  ): Promise<Stream> {
    return this.streamsService.update(id, updateStreamDto);
  }
}
