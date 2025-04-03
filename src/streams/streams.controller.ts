import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Headers,
} from "@nestjs/common";
import { StreamsService } from "./streams.service";
import { CreateStreamDto } from "./dto/create-stream.dto";
import { UpdateStreamDto } from "./dto/update-stream.dto";

@Controller("api/streams")
export class StreamsController {
  constructor(private readonly streamsService: StreamsService) {}

  @Post()
  async create(
    @Headers("x-session-id") sessionId: string,
    @Body() createStreamDto: CreateStreamDto
  ) {
    return this.streamsService.create(createStreamDto);
  }

  @Get(":id")
  async findOne(
    @Headers("x-session-id") sessionId: string,
    @Param("id") id: string
  ) {
    return this.streamsService.findOne(id);
  }

  @Put(":id")
  async update(
    @Headers("x-session-id") sessionId: string,
    @Param("id") id: string,
    @Body() updateStreamDto: UpdateStreamDto
  ) {
    return this.streamsService.update(id, updateStreamDto);
  }

  @Delete(":id")
  async remove(
    @Headers("x-session-id") sessionId: string,
    @Param("id") id: string
  ) {
    return this.streamsService.remove(id);
  }

  @Get("by-handler/:handlerId")
  async findByHandlerId(
    @Headers("x-session-id") sessionId: string,
    @Param("handlerId") handlerId: string
  ) {
    return this.streamsService.findByHandlerId(handlerId);
  }
}
