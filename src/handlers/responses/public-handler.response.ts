import { OmitType } from "@nestjs/swagger";

import { Handler } from "../entities/handler.entity";

export class PublicHandlerResponse extends OmitType(Handler, ["authToken"]) {}
