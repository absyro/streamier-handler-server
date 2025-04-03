import type { ExecutionContext } from "@nestjs/common";
import type { Request } from "express";
import type { DataSource } from "typeorm";

import {
  BadRequestException,
  createParamDecorator,
  UnauthorizedException,
} from "@nestjs/common";

export const UserId = (dataSource: DataSource) =>
  createParamDecorator(
    async (_data: unknown, ctx: ExecutionContext): Promise<string> => {
      const request = ctx.switchToHttp().getRequest<Request>();

      const sessionId = request.headers["x-session-id"];

      if (!sessionId) {
        throw new BadRequestException("Missing header: x-session-id");
      }

      const result = await dataSource.query<{ user_id: string }[]>(
        "SELECT user_id FROM sessions WHERE id = ?",
        [sessionId],
      );

      if (!result || result.length === 0) {
        throw new UnauthorizedException("Invalid session");
      }

      return result[0].user_id;
    },
  )();
