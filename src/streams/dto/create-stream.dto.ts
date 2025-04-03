import { IsString, IsNotEmpty, IsObject, MaxLength } from "class-validator";

export class CreateStreamDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsObject()
  configuration: Record<string, unknown>;

  @IsString()
  @IsNotEmpty()
  handlerId: string;
}
