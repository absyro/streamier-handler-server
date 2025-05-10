import type { Server, ServerOptions } from "socket.io";

import { IoAdapter } from "@nestjs/platform-socket.io";

/**
 * Custom WebSocket adapter for Socket.IO server configuration.
 *
 * Extends the default IoAdapter to provide:
 *
 * - Custom CORS configuration
 * - Authentication middleware
 * - WebSocket server customization
 *
 * The adapter configures the Socket.IO server with:
 *
 * - CORS enabled for GET and POST methods
 * - All origins allowed
 * - Basic authentication middleware
 *
 * @class WsAdapter
 */
export class WsAdapter extends IoAdapter {
  /**
   * Creates and configures a Socket.IO server instance.
   *
   * Creates a Socket.IO server with custom configuration:
   *
   * - Enables CORS for GET and POST methods
   * - Allows connections from any origin
   * - Adds authentication middleware
   *
   * @param {number} port - The port number to listen on
   * @param {ServerOptions} [options] - Optional Socket.IO server configuration
   * @returns The configured Socket.IO server instance
   */
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
