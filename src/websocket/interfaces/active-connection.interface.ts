import type { Socket } from "socket.io";

import type { Handler } from "../../handlers/entities/handler.entity";

export interface ActiveConnection {
  handler: Handler;
  socket: Socket;
}
