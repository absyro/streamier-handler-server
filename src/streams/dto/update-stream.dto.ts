import { PartialType } from "@nestjs/mapped-types";
import { CreateStreamDto } from "./create-stream.dto";
import { IsBoolean, IsOptional } from "class-validator";

export class UpdateStreamDto extends PartialType(CreateStreamDto) {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
