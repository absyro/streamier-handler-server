import type { ServerOptions } from "socket.io";

import { IoAdapter } from "@nestjs/platform-socket.io";

export class WsAdapter extends IoAdapter {
  public override createIOServer(
    port: number,
    options?: ServerOptions,
  ): unknown {
    const server = super.createIOServer(port, {
      ...options,
      cors: {
        methods: ["GET", "POST"],
        origin: "*",
      },
    }) as unknown;

    return server;
  }
}
