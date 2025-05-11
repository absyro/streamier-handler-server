import { PartialType } from "@nestjs/swagger";

import { CreateHandlerDto } from "./create-handler.dto";

export class UpdateHandlerDto extends PartialType(CreateHandlerDto) {}
