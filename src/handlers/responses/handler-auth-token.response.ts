import { PickType } from "@nestjs/swagger";

import { Handler } from "../entities/handler.entity";

export class HandlerAuthTokenResponse extends PickType(Handler, [
  "authToken",
]) {}
