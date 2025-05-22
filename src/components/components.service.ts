import { BadGatewayException, Injectable } from "@nestjs/common";
import { validate } from "nestjs-zod";
import { z } from "zod";

import { CommonService } from "../common/common.service";
import { ComponentDto } from "./dto/component.dto";
import { componentSchema } from "./schemas/component.schema";

@Injectable()
export class ComponentsService {
  public constructor(private readonly commonService: CommonService) {}

  public async listComponents(handlerId: string): Promise<ComponentDto[]> {
    const response = await this.commonService.emitToHandler(
      handlerId,
      "components:list",
    );

    const { components } = validate(
      response,
      z.object({ components: componentSchema.array() }),
      (zodError) => new BadGatewayException(zodError),
    );

    return components;
  }
}
