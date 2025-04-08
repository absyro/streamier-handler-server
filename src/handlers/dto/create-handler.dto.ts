import { ApiProperty } from "@nestjs/swagger";
import { IsString, MaxLength } from "class-validator";

export class CreateHandlerDto {
  @ApiProperty()
  @IsString()
  @MaxLength(12)
  public iconId!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(1000)
  public longDescription!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  public name!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(180)
  public shortDescription!: string;
}
