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
import { StreamsService } from "./streams.service";

@Controller("api/streams")
export class StreamsController {
  constructor(private readonly streamsService: StreamsService) {}

  @Post()
  public async create(
    @Headers("x-session-id") sessionId: string,
    @Body() createStreamDto: CreateStreamDto,
  ) {
    return this.streamsService.create(createStreamDto);
  }

  @Get("by-handler/:handlerId")
  public async findByHandlerId(
    @Headers("x-session-id") sessionId: string,
    @Param("handlerId") handlerId: string,
  ) {
    return this.streamsService.findByHandlerId(handlerId);
  }

  @Get(":id")
  public async findOne(
    @Headers("x-session-id") sessionId: string,
    @Param("id") id: string,
  ) {
    return this.streamsService.findOne(id);
  }

  @Delete(":id")
  public async remove(
    @Headers("x-session-id") sessionId: string,
    @Param("id") id: string,
  ) {
    return this.streamsService.remove(id);
  }

  @Put(":id")
  public async update(
    @Headers("x-session-id") sessionId: string,
    @Param("id") id: string,
    @Body() updateStreamDto: UpdateStreamDto,
  ) {
    return this.streamsService.update(id, updateStreamDto);
  }
}
