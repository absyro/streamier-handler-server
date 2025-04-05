import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UnauthorizedException,
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiHeader,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { Request } from "express";
import { CommonService } from "src/common/common.service";

import { CreateStreamDto } from "./dto/create-stream.dto";
import { UpdateStreamDto } from "./dto/update-stream.dto";
import { StreamsService } from "./streams.service";

@ApiBadRequestResponse({ description: "Bad request" })
@ApiHeader({
  description: "The ID of the session",
  name: "x-session-id",
  required: true,
})
@ApiTags("Streams")
@Controller("api/streams/:handlerId")
export class StreamsController {
  public constructor(
    private readonly streamsService: StreamsService,
    private readonly commonService: CommonService,
  ) {}

  @ApiCreatedResponse({ description: "Stream successfully created" })
  @ApiNotFoundResponse({ description: "Handler not found" })
  @ApiOperation({ summary: "Create a new stream" })
  @Post()
  public async createStream(
    @Body() createStreamDto: CreateStreamDto,
    @Param("handlerId") handlerId: string,
    @Req() request: Request,
  ): Promise<object> {
    const userId = await this.commonService.getUserIdFromRequest(request);

    if (typeof userId !== "string") {
      throw new UnauthorizedException();
    }

    return this.streamsService.createStream(handlerId, userId, createStreamDto);
  }

  @ApiNotFoundResponse({ description: "Stream not found" })
  @ApiOkResponse({ description: "Stream successfully deleted" })
  @ApiOperation({ summary: "Delete a stream" })
  @Delete(":streamId")
  public async deleteStream(
    @Param("handlerId") handlerId: string,
    @Param("streamId") streamId: string,
    @Req() request: Request,
  ): Promise<void> {
    const userId = await this.commonService.getUserIdFromRequest(request);

    if (typeof userId !== "string") {
      throw new UnauthorizedException();
    }

    return this.streamsService.deleteStream(handlerId, userId, streamId);
  }

  @ApiNotFoundResponse({ description: "Stream not found" })
  @ApiOkResponse({ description: "Stream details" })
  @ApiOperation({ summary: "Get stream details" })
  @Get(":streamId")
  public async readStream(
    @Param("handlerId") handlerId: string,
    @Param("streamId") streamId: string,
    @Req() request: Request,
  ): Promise<object> {
    const userId = await this.commonService.getUserIdFromRequest(request);

    if (typeof userId !== "string") {
      throw new UnauthorizedException();
    }

    return this.streamsService.readStream(handlerId, userId, streamId);
  }

  @ApiNotFoundResponse({ description: "Stream not found" })
  @ApiOkResponse({ description: "Stream successfully updated" })
  @ApiOperation({ summary: "Update a stream" })
  @Put(":streamId")
  public async updateStream(
    @Param("handlerId") handlerId: string,
    @Param("streamId") streamId: string,
    @Body() updateStreamDto: UpdateStreamDto,
    @Req() request: Request,
  ): Promise<object> {
    const userId = await this.commonService.getUserIdFromRequest(request);

    if (typeof userId !== "string") {
      throw new UnauthorizedException();
    }

    return this.streamsService.updateStream(
      handlerId,
      userId,
      streamId,
      updateStreamDto,
    );
  }
}
