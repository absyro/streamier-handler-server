import { Socket } from "socket.io";
import { Handler } from "../../handlers/entities/handler.entity";

export interface ActiveConnection {
  socket: Socket;
  handler: Handler;
}
