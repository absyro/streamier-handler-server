import { BadGatewayException, Injectable } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { isObject, validateSync } from "class-validator";
import { isArray, isEmpty } from "radash";

import { CommonService } from "../common/common.service";
import { Component } from "./classes/component.class";

@Injectable()
export class ComponentsService {
  public constructor(private readonly commonService: CommonService) {}

  public async listComponents(handlerId: string): Promise<Component[]> {
    const response = await this.commonService.emitToHandler(
      handlerId,
      "components:list",
    );

    if (!("components" in response) || !isArray(response.components)) {
      throw new BadGatewayException(
        "Received components from handler are invalid",
      );
    }

    const components = response.components.map((component: unknown) => {
      const instance = plainToInstance(Component, component);

      const errors = validateSync(instance);

      if (!isEmpty(errors)) {
        throw new BadGatewayException(
          "Received components from handler are invalid",
        );
      }

      return instance;
    });

    return components;
  }

  public async readComponent(
    handlerId: string,
    componentName: string,
  ): Promise<Component> {
    const response = await this.commonService.emitToHandler(
      handlerId,
      "components:read",
      componentName,
    );

    if (!("component" in response) || !isObject(response.component)) {
      throw new BadGatewayException(
        "Received component from handler is invalid",
      );
    }

    const component = plainToInstance(Component, response.component);

    const errors = validateSync(component);

    if (!isEmpty(errors)) {
      throw new BadGatewayException(
        "Received component from handler is invalid",
      );
    }

    if (component.name !== componentName) {
      throw new BadGatewayException(
        "Received component name does not match requested component name",
      );
    }

    return component;
  }
}
