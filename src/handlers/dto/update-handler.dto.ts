import { IsString, MaxLength, IsOptional } from "class-validator";
import { PartialType } from "@nestjs/mapped-types";
import { CreateHandlerDto } from "./create-handler.dto";

export class UpdateHandlerDto extends PartialType(CreateHandlerDto) {}
