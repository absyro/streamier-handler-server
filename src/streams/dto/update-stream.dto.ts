import { PartialType } from "@nestjs/mapped-types";
import { IsBoolean, IsOptional } from "class-validator";

import { CreateStreamDto } from "./create-stream.dto";

export class UpdateStreamDto extends PartialType(CreateStreamDto) {
  @IsBoolean()
  @IsOptional()
  public isActive?: boolean;
}
