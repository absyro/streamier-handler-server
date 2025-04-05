import { PartialType } from "@nestjs/mapped-types";
import { IsBoolean } from "class-validator";

import { CreateStreamDto } from "./create-stream.dto";

export class UpdateHandlerDto extends PartialType(CreateStreamDto) {
  @IsBoolean()
  public isActive?: boolean;
}
