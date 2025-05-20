import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UnauthorizedException,
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiHeader,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { Request } from "express";
import { ReasonPhrases } from "http-status-codes";
import { dedent } from "ts-dedent";

import { CommonService } from "../common/common.service";
import { CreateHandlerDto } from "./dto/create-handler.dto";
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
    schema: {
      properties: {
        error: {
          enum: [ReasonPhrases.BAD_REQUEST],
          type: "string",
        },
        message: {
          type: "string",
        },
        statusCode: {
          enum: [HttpStatus.BAD_REQUEST],
          type: "number",
        },
      },
      required: ["error", "message", "statusCode"],
      type: "object",
    },
  })
  @ApiCreatedResponse({
    description: "Handler successfully created",
    type: HandlerDto,
  })
  @ApiForbiddenResponse({
    description: "User has reached the maximum limit of handlers (100)",
    schema: {
      properties: {
        error: {
          enum: [ReasonPhrases.FORBIDDEN],
          type: "string",
        },
        message: {
          type: "string",
        },
        statusCode: {
          enum: [HttpStatus.FORBIDDEN],
          type: "number",
        },
      },
      required: ["error", "message", "statusCode"],
      type: "object",
    },
  })
  @ApiHeader({
    description: "Session ID for authentication",
    name: "X-Session-Id",
    required: true,
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
    schema: {
      properties: {
        error: {
          enum: [ReasonPhrases.UNAUTHORIZED],
          type: "string",
        },
        message: {
          type: "string",
        },
        statusCode: {
          enum: [HttpStatus.UNAUTHORIZED],
          type: "number",
        },
      },
      required: ["error", "message", "statusCode"],
      type: "object",
    },
  })
  @Post()
  public async createHandler(
    @Body() createHandlerDto: CreateHandlerDto,
    @Req() request: Request,
  ): Promise<HandlerDto> {
    const userId = await this.commonService.getUserIdFromRequest(request);

    if (userId === null) {
      throw new UnauthorizedException("Missing or invalid authentication");
    }

    return this.handlersService.createOne(userId, createHandlerDto);
  }

  @ApiHeader({
    description: "Session ID for authentication",
    name: "X-Session-Id",
    required: true,
  })
  @ApiNoContentResponse({ description: "Handler successfully deleted" })
  @ApiNotFoundResponse({
    description: "Handler not found",
    schema: {
      properties: {
        error: {
          enum: [ReasonPhrases.NOT_FOUND],
          type: "string",
        },
        message: {
          type: "string",
        },
        statusCode: {
          enum: [HttpStatus.NOT_FOUND],
          type: "number",
        },
      },
      required: ["error", "message", "statusCode"],
      type: "object",
    },
  })
  @ApiOperation({
    description:
      "Deletes a specific handler. Only handlers belonging to the authenticated user can be deleted.",
    summary: "Delete handler",
  })
  @ApiUnauthorizedResponse({
    description: "Missing or invalid authentication",
    schema: {
      properties: {
        error: {
          enum: [ReasonPhrases.UNAUTHORIZED],
          type: "string",
        },
        message: {
          type: "string",
        },
        statusCode: {
          enum: [HttpStatus.UNAUTHORIZED],
          type: "number",
        },
      },
      required: ["error", "message", "statusCode"],
      type: "object",
    },
  })
  @Delete(":handlerId")
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteHandler(
    @Param("handlerId") handlerId: string,
    @Req() request: Request,
  ): Promise<void> {
    const userId = await this.commonService.getUserIdFromRequest(request);

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

  @ApiBadRequestResponse({
    description: "Request query parameters are invalid",
    schema: {
      properties: {
        error: {
          enum: [ReasonPhrases.BAD_REQUEST],
          type: "string",
        },
        message: {
          type: "string",
        },
        statusCode: {
          enum: [HttpStatus.BAD_REQUEST],
          type: "number",
        },
      },
      required: ["error", "message", "statusCode"],
      type: "object",
    },
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
    schema: {
      properties: {
        error: {
          enum: [ReasonPhrases.NOT_FOUND],
          type: "string",
        },
        message: {
          type: "string",
        },
        statusCode: {
          enum: [HttpStatus.NOT_FOUND],
          type: "number",
        },
      },
      required: ["error", "message", "statusCode"],
      type: "object",
    },
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

  @ApiHeader({
    description: "Session ID for authentication",
    name: "X-Session-Id",
    required: true,
  })
  @ApiNotFoundResponse({
    description: "Handler not found",
    schema: {
      properties: {
        error: {
          enum: [ReasonPhrases.NOT_FOUND],
          type: "string",
        },
        message: {
          type: "string",
        },
        statusCode: {
          enum: [HttpStatus.NOT_FOUND],
          type: "number",
        },
      },
      required: ["error", "message", "statusCode"],
      type: "object",
    },
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
    schema: {
      properties: {
        error: {
          enum: [ReasonPhrases.UNAUTHORIZED],
          type: "string",
        },
        message: {
          type: "string",
        },
        statusCode: {
          enum: [HttpStatus.UNAUTHORIZED],
          type: "number",
        },
      },
      required: ["error", "message", "statusCode"],
      type: "object",
    },
  })
  @Patch(":handlerId/auth-token")
  public async regenerateAuthToken(
    @Param("handlerId") handlerId: string,
    @Req() request: Request,
  ): Promise<HandlerDto["authToken"]> {
    const userId = await this.commonService.getUserIdFromRequest(request);

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
    schema: {
      properties: {
        error: {
          enum: [ReasonPhrases.BAD_REQUEST],
          type: "string",
        },
        message: {
          type: "string",
        },
        statusCode: {
          enum: [HttpStatus.BAD_REQUEST],
          type: "number",
        },
      },
      required: ["error", "message", "statusCode"],
      type: "object",
    },
  })
  @ApiHeader({
    description: "Session ID for authentication",
    name: "X-Session-Id",
    required: true,
  })
  @ApiNotFoundResponse({
    description: "Handler not found",
    schema: {
      properties: {
        error: {
          enum: [ReasonPhrases.NOT_FOUND],
          type: "string",
        },
        message: {
          type: "string",
        },
        statusCode: {
          enum: [HttpStatus.NOT_FOUND],
          type: "number",
        },
      },
      required: ["error", "message", "statusCode"],
      type: "object",
    },
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
    schema: {
      properties: {
        error: {
          enum: [ReasonPhrases.UNAUTHORIZED],
          type: "string",
        },
        message: {
          type: "string",
        },
        statusCode: {
          enum: [HttpStatus.UNAUTHORIZED],
          type: "number",
        },
      },
      required: ["error", "message", "statusCode"],
      type: "object",
    },
  })
  @Put(":handlerId")
  public async updateHandler(
    @Param("handlerId") handlerId: string,
    @Body() updateHandlerDto: UpdateHandlerDto,
    @Req() request: Request,
  ): Promise<PermittedHandlerDto> {
    const userId = await this.commonService.getUserIdFromRequest(request);

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
