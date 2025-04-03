import { IsNotEmpty, IsObject, IsString, MaxLength } from "class-validator";

export class CreateStreamDto {
  @IsObject()
  public configuration: Record<string, unknown>;

  @IsNotEmpty()
  @IsString()
  public handlerId: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  public name: string;
}
