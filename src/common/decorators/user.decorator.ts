import type { ExecutionContext } from "@nestjs/common";
import type { Request } from "express";

import { createParamDecorator } from "@nestjs/common";
import { DataSource } from "typeorm";

export const User = createParamDecorator(
  async (_data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<Request>();

    const sessionId = request.headers["x-session-id"];

    if (!sessionId) {
      return null;
    }

    const dataSource = request.app.get(DataSource);

    try {
      const session = await dataSource.query(
        "SELECT * FROM sessions WHERE id = $1",
        [sessionId],
      );

      if (!session.length) {
        return null;
      }

      const userId = session[0].user_id,
        user = await dataSource.query("SELECT * FROM users WHERE id = $1", [
          userId,
        ]);

      return user.length ? user[0] : null;
    } catch (error) {
      console.error("Error fetching user from session:", error);

      return null;
    }
  },
);
