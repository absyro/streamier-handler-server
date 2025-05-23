import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { validate } from "nestjs-zod";
import { DataSource, Repository } from "typeorm";
import { z } from "zod";

import { Handler } from "@/handlers/entities/handler.entity";
import { HandlersGateway } from "@/handlers/handlers.gateway";

@Injectable()
export class CommonService {
  public constructor(
    private readonly dataSource: DataSource,
    private readonly handlersGateway: HandlersGateway,
    @InjectRepository(Handler)
    private readonly handlersRepository: Repository<Handler>,
  ) {}

  public async doesUserExist(userId: string): Promise<boolean> {
    const result = await this.dataSource.query<{ exists: boolean }[]>(
      "SELECT EXISTS(SELECT 1 FROM users WHERE id = $1)",
      [userId],
    );

    return result[0]?.exists ?? false;
  }

  public async emitToHandler(
    handlerId: string,
    event: string,
    ...parameters: unknown[]
  ): Promise<object> {
    const doesHandlerExist = await this.handlersRepository.exists({
      where: { id: handlerId },
    });

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
        const responseSchema = z.discriminatedUnion("success", [
          z.object({
            success: z.literal(true),
          }),
          z
            .object({
              error: z.string().nonempty().max(500),
              success: z.literal(false),
            })
            .strict(),
        ]);

        const validatedResponse = validate(
          response,
          responseSchema,
          (zodError) => new BadGatewayException(zodError),
        );

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
