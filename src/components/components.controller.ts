import { Controller, Get, HttpStatus, Param } from "@nestjs/common";
import {
  ApiBadGatewayResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiServiceUnavailableResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { ReasonPhrases } from "http-status-codes";
import { dedent } from "ts-dedent";

import { ComponentsService } from "./components.service";
import { ComponentDto } from "./dto/component.dto";

@ApiBadGatewayResponse({
  description: "Received data from handler is invalid",
  schema: {
    properties: {
      error: {
        enum: [ReasonPhrases.BAD_GATEWAY],
        type: "string",
      },
      message: {
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
@ApiServiceUnavailableResponse({
  description: "Handler is offline",
  schema: {
    properties: {
      error: {
        enum: [ReasonPhrases.SERVICE_UNAVAILABLE],
        type: "string",
      },
      message: {
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

  @ApiOkResponse({
    description: "Successfully retrieved component details",
    type: ComponentDto,
  })
  @ApiOperation({
    description:
      "Retrieves a specific component by name for a given handler ID.",
    summary: "Read component",
  })
  @Get(":componentName")
  public async getComponent(
    @Param("handlerId") handlerId: string,
    @Param("componentName") componentName: string,
  ): Promise<ComponentDto> {
    const component = await this.componentsService.getComponent(
      handlerId,
      componentName,
    );

    return component;
  }

  @ApiOkResponse({
    description: "Successfully retrieved handler components",
    type: [ComponentDto],
  })
  @ApiOperation({
    description: "Retrieves all components associated with a given handler ID.",
    summary: "List components",
  })
  @Get()
  public async listComponents(
    @Param("handlerId") handlerId: string,
  ): Promise<ComponentDto[]> {
    const components = await this.componentsService.listComponents(handlerId);

    return components;
  }
}
