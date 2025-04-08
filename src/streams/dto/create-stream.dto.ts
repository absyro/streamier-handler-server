import { ApiProperty } from "@nestjs/swagger";
import { IsObject, IsString, MaxLength } from "class-validator";

export class CreateStreamDto {
  @ApiProperty()
  @IsObject()
  public configuration!: Record<string, unknown>;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  public name!: string;
}
