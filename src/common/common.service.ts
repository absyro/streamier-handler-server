import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import { validate } from "nestjs-zod";
import { DataSource } from "typeorm";
import { z } from "zod";

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
    ...parameters: unknown[]
  ): Promise<object> {
    const doesHandlerExist = await this.handlersService.exists(handlerId);

    if (!doesHandlerExist) {
      throw new NotFoundException("Handler not found");
    }

    const sockets = await this.handlersGateway.server.fetchSockets();

    const socket = sockets.find((s) => s.data.id === handlerId);

    if (!socket) {
      throw new ServiceUnavailableException("Handler is offline");
    }

    return new Promise((resolve, reject) => {
      socket.emit(event, ...parameters, (response: unknown) => {
        const responseSchema = z.union([
          z.object({ success: z.literal(true) }),
          z
            .object({
              success: z.literal(false),
              unauthorized: z.string().nonempty(),
            })
            .strict(),
          z
            .object({
              error: z.string().nonempty(),
              success: z.literal(false),
            })
            .strict(),
        ]);

        const validatedResponse = validate(
          response,
          responseSchema,
          (zodError) => new BadGatewayException(zodError),
        );

        if ("unauthorized" in validatedResponse) {
          reject(new UnauthorizedException(validatedResponse.unauthorized));

          return;
        }

        if ("error" in validatedResponse) {
          reject(new BadRequestException(validatedResponse.error));

          return;
        }

        resolve(validatedResponse);
      });
    });
  }

  public async getUserIdFromSessionId(
    sessionId: string,
  ): Promise<null | string> {
    const result = await this.dataSource.query<{ user_id: string }[]>(
      "SELECT user_id FROM user_sessions WHERE id = $1",
      [sessionId],
    );

    return result[0]?.user_id ?? null;
  }
}
