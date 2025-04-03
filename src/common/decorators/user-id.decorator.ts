import type { ExecutionContext } from "@nestjs/common";
import type { Request } from "express";

import {
  BadRequestException,
  createParamDecorator,
  UnauthorizedException,
} from "@nestjs/common";
import { DataSource } from "typeorm";

export const UserId = createParamDecorator(
  async (_data: unknown, ctx: ExecutionContext): Promise<string> => {
    const request = ctx.switchToHttp().getRequest<Request>();

    const sessionId = request.headers["x-session-id"];

    if (!sessionId) {
      throw new BadRequestException("Missing x-session-id header");
    }

    const dataSource = request.app.get(DataSource) as unknown as DataSource;

    const result = await dataSource.query<
      {
        [key: string]: unknown;
        user_id: string;
      }[]
    >("SELECT user_id FROM sessions WHERE id = ?", [sessionId]);

    if (!result || result.length === 0) {
      throw new UnauthorizedException("Invalid session");
    }

    return result[0].user_id;
  },
);
