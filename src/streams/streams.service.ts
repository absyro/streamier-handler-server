import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  NotImplementedException,
} from "@nestjs/common";
import { HandlersGateway } from "src/handlers/handlers.gateway";

import { CreateStreamDto } from "./dto/create-stream.dto";

@Injectable()
export class StreamsService {
  public constructor(private readonly handlersGateway: HandlersGateway) {}

  public async createStream(
    handlerId: string,
    createStreamDto: CreateStreamDto,
  ): Promise<object> {
    const { server } = this.handlersGateway;

    const sockets = await server.fetchSockets();

    const socket = sockets.find(({ data }) => data.id === handlerId);

    if (!socket) {
      throw new NotFoundException("Handler not found");
    }

    return new Promise((resolve, reject) => {
      socket.emit("stream:create", createStreamDto, (response: unknown) => {
        if (!(response instanceof Object)) {
          reject(new NotImplementedException("Invalid response format"));

          return;
        }

        if ("error" in response) {
          if (typeof response.error === "string") {
            reject(new BadRequestException(response.error));

            return;
          }

          reject(new NotImplementedException("Invalid error format"));

          return;
        }

        if ("stream" in response && response.stream instanceof Object) {
          resolve(response.stream);

          return;
        }

        reject(new InternalServerErrorException("Invalid response format"));
      });
    });
  }
}
