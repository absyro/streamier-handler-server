import type { ExecutionContext } from "@nestjs/common";
import type { Request } from "express";

import { createParamDecorator } from "@nestjs/common";

export const Session = createParamDecorator((_, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest<Request>();

  return request.headers["x-session-id"];
});
