import type { Server, ServerOptions } from "socket.io";

import { IoAdapter } from "@nestjs/platform-socket.io";

export class WsAdapter extends IoAdapter {
  public override createIOServer(
    port: number,
    options?: ServerOptions,
  ): Server {
    const server = super.createIOServer(port, {
      ...options,
      cors: {
        methods: ["GET", "POST"],
        origin: "*",
      },
    } satisfies Partial<ServerOptions>) as Server;

    server.use((_, next) => {
      next(new Error("unauthorized"));
    });

    return server;
  }
}
