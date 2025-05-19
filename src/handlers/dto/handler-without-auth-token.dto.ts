import { OmitType } from "@nestjs/swagger";

import { Handler } from "../entities/handler.entity";

export class HandlerWithoutAuthTokenDto extends OmitType(Handler, [
  "authToken",
]) {}
