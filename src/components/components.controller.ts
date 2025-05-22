import { Controller, Get, Param } from "@nestjs/common";
import {
  ApiBadGatewayResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiServiceUnavailableResponse,
  ApiTags,
} from "@nestjs/swagger";
import { dedent } from "ts-dedent";

import { BadGatewayResponseDto } from "../common/dto/bad-gateway-response.dto";
import { NotFoundResponseDto } from "../common/dto/not-found-response.dto";
import { ServiceUnavailableResponseDto } from "../common/dto/service-unavailable-response.dto";
import { ComponentsService } from "./components.service";
import { ComponentDto } from "./dto/component.dto";

@ApiBadGatewayResponse({
  description: "Received data from handler is invalid",
  type: BadGatewayResponseDto,
})
@ApiNotFoundResponse({
  description: "Handler not found",
  type: NotFoundResponseDto,
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
  type: ServiceUnavailableResponseDto,
})
@ApiTags("Components")
@Controller("api/handlers/:handlerId/components")
export class ComponentsController {
  public constructor(private readonly componentsService: ComponentsService) {}

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
