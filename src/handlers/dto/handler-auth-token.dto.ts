import { PickType } from "@nestjs/swagger";

import { Handler } from "../entities/handler.entity";

export class HandlerAuthTokenDto extends PickType(Handler, ["authToken"]) {}
