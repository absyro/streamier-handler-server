import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
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
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { isString } from "class-validator";
import { Request } from "express";
import { ReasonPhrases } from "http-status-codes";
import { dedent } from "ts-dedent";

import { CommonService } from "../common/common.service";
import { CreateHandlerDto } from "./dto/create-handler.dto";
import { SearchHandlerDto } from "./dto/search-handler.dto";
import { UpdateHandlerDto } from "./dto/update-handler.dto";
import { Handler } from "./entities/handler.entity";
import { HandlersService } from "./handlers.service";
import { HandlerAuthTokenResponse } from "./responses/handler-auth-token.response";
import { PublicHandlerResponse } from "./responses/public-handler.response";

@ApiQuery({
  description: dedent`
  The fields to include in the response.

  Uses json-mask to select the fields to include in the response.

  See https://github.com/nemtsov/json-mask for more information.

  If not provided, all fields will be included.`,
  name: "fields",
  required: false,
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
          oneOf: [
            {
              example: "X must be a string",
              type: "string",
            },
            {
              items: {
                example: "X must be a string",
                type: "string",
              },
              type: "array",
            },
          ],
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
    type: Handler,
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
          example:
            "You have reached the maximum limit of 100 handlers per user",
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
    example: "s123456789",
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
          example: "Missing or invalid authentication",
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
  ): Promise<Handler> {
    const userId = await this.commonService.getUserIdFromRequest(request);

    if (!isString(userId)) {
      throw new UnauthorizedException("Missing or invalid authentication");
    }

    return this.handlersService.createOne(userId, createHandlerDto);
  }

  @ApiHeader({
    description: "Session ID for authentication",
    example: "s123456789",
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
          example: "Handler not found",
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
  @ApiParam({
    description: "The ID of the handler to delete",
    example: "h1234567",
    name: "handlerId",
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
          example: "Missing or invalid authentication",
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

    if (!isString(userId)) {
      throw new UnauthorizedException("Missing or invalid authentication");
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
          oneOf: [
            {
              example: "X must be between 1 and 100",
              type: "string",
            },
            {
              items: {
                example: "X must be between 1 and 100",
                type: "string",
              },
              type: "array",
            },
          ],
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
    type: [PublicHandlerResponse],
  })
  @ApiOperation({
    description: dedent`
    Gets handlers based on various criteria including:
    - Text search across name and descriptions
    - Filter by online status
    - Pagination support with limit and offset`,
    summary: "List handlers",
  })
  @Get()
  public async listHandlers(
    @Query() searchDto: SearchHandlerDto,
  ): Promise<Omit<Handler, "authToken" | "updateTimestamp">[]> {
    const handlers = await this.handlersService.search(searchDto);

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
          example: "Handler not found",
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
    type: PublicHandlerResponse,
  })
  @ApiOperation({
    description: "Retrieves information about a specific handler.",
    summary: "Read handler",
  })
  @ApiParam({
    description: "The ID of the handler to retrieve",
    example: "h1234567",
    name: "handlerId",
  })
  @Get(":handlerId")
  public async readHandler(
    @Param("handlerId") handlerId: string,
  ): Promise<Omit<Handler, "authToken" | "updateTimestamp">> {
    const handler = await this.handlersService.findOne(handlerId);

    if (!handler) {
      throw new NotFoundException("Handler not found");
    }

    const { authToken, ...handlerWithoutAuthToken } = handler;

    return handlerWithoutAuthToken;
  }

  @ApiHeader({
    description: "Session ID for authentication",
    example: "s123456789",
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
          example: "Handler not found",
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
    type: HandlerAuthTokenResponse,
  })
  @ApiOperation({
    description:
      "Regenerates the authentication token for a specific handler. Only handlers belonging to the authenticated user can be modified.",
    summary: "Regenerate auth token",
  })
  @ApiParam({
    description: "The ID of the handler to regenerate token for",
    example: "h1234567",
    name: "handlerId",
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
          example: "Missing or invalid authentication",
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
  ): Promise<Pick<Handler, "authToken">> {
    const userId = await this.commonService.getUserIdFromRequest(request);

    if (!isString(userId)) {
      throw new UnauthorizedException("Missing or invalid authentication");
    }

    const handler = await this.handlersService.regenerateAuthToken(
      handlerId,
      userId,
    );

    return { authToken: handler.authToken };
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
          oneOf: [
            {
              example: "X must be a string",
              type: "string",
            },
            {
              items: {
                example: "X must be a string",
                type: "string",
              },
              type: "array",
            },
          ],
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
    example: "s123456789",
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
          example: "Handler not found",
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
    type: PublicHandlerResponse,
  })
  @ApiOperation({
    description:
      "Updates the configuration of a specific handler. Only handlers belonging to the authenticated user can be updated.",
    summary: "Update handler",
  })
  @ApiParam({
    description: "The ID of the handler to update",
    example: "h1234567",
    name: "handlerId",
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
          example: "Missing or invalid authentication",
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
  ): Promise<Omit<Handler, "authToken" | "updateTimestamp">> {
    const userId = await this.commonService.getUserIdFromRequest(request);

    if (!isString(userId)) {
      throw new UnauthorizedException("Missing or invalid authentication");
    }

    const { authToken, ...handler } = await this.handlersService.updateOne(
      handlerId,
      updateHandlerDto,
    );

    return handler;
  }
}
