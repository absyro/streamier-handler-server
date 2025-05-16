import { Controller, Get, HttpStatus, Param } from "@nestjs/common";
import {
  ApiBadGatewayResponse,
  ApiHeader,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiServiceUnavailableResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { ReasonPhrases } from "http-status-codes";
import { dedent } from "ts-dedent";

import { Component } from "./classes/component.class";
import { ComponentsService } from "./components.service";

@ApiBadGatewayResponse({
  description: "Received data from handler is invalid",
  schema: {
    properties: {
      error: {
        enum: [ReasonPhrases.BAD_GATEWAY],
        type: "string",
      },
      message: {
        example: "Received stream from handler is invalid",
        type: "string",
      },
      statusCode: {
        enum: [HttpStatus.BAD_GATEWAY],
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
@ApiParam({
  description: "ID of the target handler",
  example: "h1234567",
  name: "handlerId",
})
@ApiQuery({
  description: dedent`
  The fields to include in the response.

  Uses json-mask to select the fields to include in the response.

  See https://github.com/nemtsov/json-mask for more information.

  If not provided, all fields will be included.`,
  name: "fields",
  required: false,
})
@ApiServiceUnavailableResponse({
  description: "Handler is offline",
  schema: {
    properties: {
      error: {
        enum: [ReasonPhrases.SERVICE_UNAVAILABLE],
        type: "string",
      },
      message: {
        example: "Handler is offline",
        type: "string",
      },
      statusCode: {
        enum: [HttpStatus.SERVICE_UNAVAILABLE],
        type: "number",
      },
    },
    required: ["error", "message", "statusCode"],
    type: "object",
  },
})
@ApiTags("Components")
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
@Controller("api/handlers/:handlerId/components")
export class ComponentsController {
  public constructor(private readonly componentsService: ComponentsService) {}

  @ApiBadGatewayResponse({
    description: "Received data from handler is invalid",
    schema: {
      properties: {
        error: {
          enum: [ReasonPhrases.BAD_GATEWAY],
          type: "string",
        },
        message: {
          example: "Received data from handler is invalid",
          type: "string",
        },
        statusCode: {
          enum: [HttpStatus.BAD_GATEWAY],
          type: "number",
        },
      },
      required: ["error", "message", "statusCode"],
      type: "object",
    },
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
    description: "Successfully retrieved handler components",
    type: [Component],
  })
  @ApiOperation({
    description: "Retrieves all components associated with a given handler ID.",
    summary: "List components",
  })
  @ApiParam({
    description: "The ID of the handler whose components are to be retrieved.",
    example: "h1234567",
    name: "handlerId",
  })
  @ApiServiceUnavailableResponse({
    description: "Handler is offline",
    schema: {
      properties: {
        error: {
          enum: [ReasonPhrases.SERVICE_UNAVAILABLE],
          type: "string",
        },
        message: {
          example: "Handler is offline",
          type: "string",
        },
        statusCode: {
          enum: [HttpStatus.SERVICE_UNAVAILABLE],
          type: "number",
        },
      },
      required: ["error", "message", "statusCode"],
      type: "object",
    },
  })
  @Get()
  public async listComponents(
    @Param("handlerId") handlerId: string,
  ): Promise<Component[]> {
    const components = await this.componentsService.listComponents(handlerId);

    return components;
  }
}
