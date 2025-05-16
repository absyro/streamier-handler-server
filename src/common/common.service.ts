import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { Request } from "express";
import { isObject, isString } from "radash";
import { DataSource } from "typeorm";

import { HandlersGateway } from "../handlers/handlers.gateway";
import { HandlersService } from "../handlers/handlers.service";

@Injectable()
export class CommonService {
  public constructor(
    private readonly dataSource: DataSource,
    private readonly handlersGateway: HandlersGateway,
    private readonly handlersService: HandlersService,
  ) {}

  public async emitToHandler(
    handlerId: string,
    event: string,
    ...data: unknown[]
  ): Promise<object> {
    const doesHandlerExist = await this.handlersService.exists(handlerId);

    if (!doesHandlerExist) {
      throw new NotFoundException("Handler not found");
    }

    const { server } = this.handlersGateway;

    const sockets = await server.fetchSockets();

    const socket = sockets.find(
      ({ data: socketData }) => socketData.id === handlerId,
    );

    if (!socket) {
      throw new ServiceUnavailableException("Handler is offline");
    }

    return new Promise((resolve, reject) => {
      socket.emit(event, ...data, (response: unknown) => {
        if (!isObject(response)) {
          reject(
            new BadGatewayException(
              "Received response from handler is invalid",
            ),
          );

          return;
        }

        if (!("success" in response) || typeof response.success !== "boolean") {
          reject(
            new BadGatewayException(
              "Received response from handler is invalid",
            ),
          );

          return;
        }

        if ("error" in response) {
          if (!isString(response.error)) {
            reject(
              new BadGatewayException(
                "Received response from handler is invalid",
              ),
            );

            return;
          }

          if (response.success) {
            reject(
              new BadGatewayException(
                "Received response from handler is invalid",
              ),
            );

            return;
          }

          reject(new BadRequestException(response.error));

          return;
        }

        if (!response.success) {
          reject(
            new BadGatewayException(
              "Received response from handler is invalid",
            ),
          );

          return;
        }

        resolve(response);
      });
    });
  }

  public async getUserIdFromRequest(request: Request): Promise<null | string> {
    const sessionId = request.headers["x-session-id"];

    if (!isString(sessionId)) {
      return null;
    }

    const result = await this.dataSource.query<{ user_id: string }[]>(
      "SELECT user_id FROM user_sessions WHERE id = $1",
      [sessionId],
    );

    return result[0]?.user_id ?? null;
  }
}
