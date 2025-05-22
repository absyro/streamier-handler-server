import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UnauthorizedException,
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { dedent } from "ts-dedent";

import { CommonService } from "../common/common.service";
import { BadRequestResponseDto } from "../common/dto/bad-request-response.dto";
import { ForbiddenResponseDto } from "../common/dto/forbidden-response.dto";
import { NotFoundResponseDto } from "../common/dto/not-found-response.dto";
import { UnauthorizedResponseDto } from "../common/dto/unauthorized-response.dto";
import { CreateHandlerDto } from "./dto/create-handler.dto";
import { HandlerComponentDto } from "./dto/handler-component.dto";
import { HandlerDto } from "./dto/handler.dto";
import { PermittedHandlerDto } from "./dto/permitted-handler.dto";
import { SearchHandlerDto } from "./dto/search-handler.dto";
import { UpdateHandlerDto } from "./dto/update-handler.dto";
import { HandlersService } from "./handlers.service";

@ApiQuery({
  description: dedent`
  The fields to include in the response.

  Uses json-mask to select the fields to include in the response.

  See https://github.com/nemtsov/json-mask for more information.

  If not provided, all fields will be included.`,
  name: "fields",
  required: false,
  type: "string",
})
@ApiTags("Handlers")
@Controller("api/handlers")
export class HandlersController {
  public constructor(
    private readonly handlersService: HandlersService,
    private readonly commonService: CommonService,
  ) {}

  @ApiBadRequestResponse({
    description: "Request body parameters are invalid",
    type: BadRequestResponseDto,
  })
  @ApiCreatedResponse({
    description: "Handler successfully created",
    type: HandlerDto,
  })
  @ApiForbiddenResponse({
    description: "User has reached the maximum limit of handlers (100)",
    type: ForbiddenResponseDto,
  })
  @ApiOperation({
    description: dedent`
    Creates a new handler with the specified configuration.

    The handler will be associated with the authenticated user and will be assigned a unique ID and authentication token.
    The authentication token can be used to establish WebSocket connections to the handler.`,
    summary: "Create handler",
  })
  @ApiUnauthorizedResponse({
    description: "Missing or invalid authentication",
    type: UnauthorizedResponseDto,
  })
  @Post()
  public async createHandler(
    @Body() createHandlerDto: CreateHandlerDto,
    @Headers("X-Session-Id") sessionId: string,
  ): Promise<HandlerDto> {
    const userId = await this.commonService.getUserIdFromSessionId(sessionId);

    if (userId === null) {
      throw new UnauthorizedException("Missing or invalid authentication");
    }

    return this.handlersService.createOne(userId, createHandlerDto);
  }

  @ApiNoContentResponse({ description: "Handler successfully deleted" })
  @ApiNotFoundResponse({
    description: "Handler not found",
    type: NotFoundResponseDto,
  })
  @ApiOperation({
    description:
      "Deletes a specific handler. Only handlers belonging to the authenticated user can be deleted.",
    summary: "Delete handler",
  })
  @ApiUnauthorizedResponse({
    description: "Missing or invalid authentication",
    type: UnauthorizedResponseDto,
  })
  @Delete(":handlerId")
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteHandler(
    @Param("handlerId") handlerId: string,
    @Headers("X-Session-Id") sessionId: string,
  ): Promise<void> {
    const userId = await this.commonService.getUserIdFromSessionId(sessionId);

    if (userId === null) {
      throw new UnauthorizedException("Missing or invalid authentication");
    }

    const handler = await this.handlersService.findOne(handlerId, {
      select: ["userId"],
    });

    if (handler.userId !== userId) {
      throw new UnauthorizedException(
        "You are not allowed to delete this handler",
      );
    }

    await this.handlersService.deleteOne(handlerId);
  }

  @ApiOkResponse({
    description: "Successfully retrieved handler components",
    type: [HandlerComponentDto],
  })
  @ApiOperation({
    description: "Retrieves all components associated with a given handler ID.",
    summary: "List handler components",
  })
  @Get(":handlerId/components")
  public async listHandlerComponents(
    @Param("handlerId") handlerId: string,
  ): Promise<HandlerComponentDto[]> {
    const handlerComponents =
      await this.handlersService.listHandlerComponents(handlerId);

    return handlerComponents;
  }

  @ApiBadRequestResponse({
    description: "Request query parameters are invalid",
    type: BadRequestResponseDto,
  })
  @ApiOkResponse({
    description: "List of handlers matching the search criteria",
    type: [PermittedHandlerDto],
  })
  @ApiOperation({
    description: dedent`
    Gets handlers based on various criteria including:
    - Text search across name and descriptions
    - Filter by active status
    - Pagination support with limit and offset`,
    summary: "List handlers",
  })
  @Get()
  public async listHandlers(
    @Query() searchHandlerDto: SearchHandlerDto,
  ): Promise<PermittedHandlerDto[]> {
    const handlers = await this.handlersService.search(searchHandlerDto);

    return handlers.map(({ authToken, ...handler }) => handler);
  }

  @ApiNotFoundResponse({
    description: "Handler not found",
    type: NotFoundResponseDto,
  })
  @ApiOkResponse({
    description: "Handler information",
    type: PermittedHandlerDto,
  })
  @ApiOperation({
    description: "Retrieves information about a specific handler.",
    summary: "Read handler",
  })
  @Get(":handlerId")
  public async readHandler(
    @Param("handlerId") handlerId: string,
  ): Promise<PermittedHandlerDto> {
    const handler = await this.handlersService.findOne(handlerId, {
      select: { authToken: false },
    });

    return handler;
  }

  @ApiNotFoundResponse({
    description: "Handler not found",
    type: NotFoundResponseDto,
  })
  @ApiOkResponse({
    description: "Auth token successfully regenerated",
    type: String,
  })
  @ApiOperation({
    description:
      "Regenerates the authentication token for a specific handler. Only handlers belonging to the authenticated user can be modified.",
    summary: "Regenerate auth token",
  })
  @ApiUnauthorizedResponse({
    description: "Missing or invalid authentication",
    type: UnauthorizedResponseDto,
  })
  @Patch(":handlerId/auth-token")
  public async regenerateAuthToken(
    @Param("handlerId") handlerId: string,
    @Headers("X-Session-Id") sessionId: string,
  ): Promise<HandlerDto["authToken"]> {
    const userId = await this.commonService.getUserIdFromSessionId(sessionId);

    if (userId === null) {
      throw new UnauthorizedException("Missing or invalid authentication");
    }

    const handler = await this.handlersService.findOne(handlerId, {
      select: ["userId"],
    });

    if (handler.userId !== userId) {
      throw new UnauthorizedException(
        "You are not allowed to regenerate the authentication token for this handler",
      );
    }

    const { authToken } =
      await this.handlersService.regenerateAuthToken(handlerId);

    return authToken;
  }

  @ApiBadRequestResponse({
    description: "Request body parameters are invalid",
    type: BadRequestResponseDto,
  })
  @ApiNotFoundResponse({
    description: "Handler not found",
    type: NotFoundResponseDto,
  })
  @ApiOkResponse({
    description: "Handler successfully updated",
    type: PermittedHandlerDto,
  })
  @ApiOperation({
    description:
      "Updates the configuration of a specific handler. Only handlers belonging to the authenticated user can be updated.",
    summary: "Update handler",
  })
  @ApiUnauthorizedResponse({
    description: "Missing or invalid authentication",
    type: UnauthorizedResponseDto,
  })
  @Put(":handlerId")
  public async updateHandler(
    @Param("handlerId") handlerId: string,
    @Body() updateHandlerDto: UpdateHandlerDto,
    @Headers("X-Session-Id") sessionId: string,
  ): Promise<PermittedHandlerDto> {
    const userId = await this.commonService.getUserIdFromSessionId(sessionId);

    if (userId === null) {
      throw new UnauthorizedException("Missing or invalid authentication");
    }

    const handler = await this.handlersService.findOne(handlerId, {
      select: ["userId"],
    });

    if (handler.userId !== userId) {
      throw new UnauthorizedException(
        "You are not allowed to update this handler",
      );
    }

    const updatedHandler = await this.handlersService.updateOne(
      handlerId,
      updateHandlerDto,
    );

    return updatedHandler;
  }
}
