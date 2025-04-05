import { IsObject, IsString, MaxLength } from "class-validator";

export class CreateStreamDto {
  @IsObject()
  public configuration!: Record<string, unknown>;

  @IsString()
  @MaxLength(100)
  public name!: string;
}
