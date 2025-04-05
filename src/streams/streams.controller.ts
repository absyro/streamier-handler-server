import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { CreateStreamDto } from "./dto/create-stream.dto";
import { UpdateStreamDto } from "./dto/update-stream.dto";
import { StreamsService } from "./streams.service";

@ApiTags("Streams")
@Controller("api/streams")
export class StreamsController {
  public constructor(private readonly streamsService: StreamsService) {}

  @ApiOperation({ summary: "Create a new stream" })
  @ApiResponse({ description: "Stream successfully created", status: 201 })
  @ApiResponse({ description: "Bad request", status: 400 })
  @ApiResponse({ description: "Handler not found", status: 404 })
  @Post()
  public async createStream(
    @Body() createStreamDto: CreateStreamDto,
    @Param("handlerId") handlerId: string,
  ): Promise<object> {
    return this.streamsService.createStream(handlerId, createStreamDto);
  }

  @ApiOperation({ summary: "Delete a stream" })
  @ApiResponse({ description: "Stream successfully deleted", status: 200 })
  @ApiResponse({ description: "Bad request", status: 400 })
  @ApiResponse({ description: "Stream not found", status: 404 })
  @Delete(":streamId")
  public async deleteStream(
    @Param("handlerId") handlerId: string,
    @Param("streamId") streamId: string,
  ): Promise<void> {
    return this.streamsService.deleteStream(handlerId, streamId);
  }

  @ApiOperation({ summary: "Get stream details" })
  @ApiResponse({ description: "Stream details", status: 200 })
  @ApiResponse({ description: "Bad request", status: 400 })
  @ApiResponse({ description: "Stream not found", status: 404 })
  @Get(":streamId")
  public async readStream(
    @Param("handlerId") handlerId: string,
    @Param("streamId") streamId: string,
  ): Promise<object> {
    return this.streamsService.readStream(handlerId, streamId);
  }

  @ApiOperation({ summary: "Update a stream" })
  @ApiResponse({ description: "Stream successfully updated", status: 200 })
  @ApiResponse({ description: "Bad request", status: 400 })
  @ApiResponse({ description: "Stream not found", status: 404 })
  @Put(":streamId")
  public async updateStream(
    @Param("handlerId") handlerId: string,
    @Param("streamId") streamId: string,
    @Body() updateStreamDto: UpdateStreamDto,
  ): Promise<object> {
    return this.streamsService.updateStream(
      handlerId,
      streamId,
      updateStreamDto,
    );
  }
}
