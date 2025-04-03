import type { ServerOptions } from "socket.io";

import { IoAdapter } from "@nestjs/platform-socket.io";

export class WsAdapter extends IoAdapter {
  public createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, {
      ...options,
      cors: {
        methods: ["GET", "POST"],
        origin: "*",
      },
    });

    return server;
  }
}
