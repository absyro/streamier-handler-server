import { ApiProperty } from "@nestjs/swagger";
import { IsString, MaxLength } from "class-validator";

export class CreateHandlerDto {
  @ApiProperty({
    description: "The ID of the handler icon from icons8.com.",
    maximum: 12,
  })
  @IsString()
  @MaxLength(12)
  public iconId!: string;

  @ApiProperty({
    description: "The long description of the handler. Supports Markdown.",
    maximum: 5000,
  })
  @IsString()
  @MaxLength(5000)
  public longDescription!: string;

  @ApiProperty({
    description: "The name of the handler.",
    maximum: 100,
  })
  @IsString()
  @MaxLength(100)
  public name!: string;

  @ApiProperty({
    description: "The short description of the handler.",
    maximum: 180,
  })
  @IsString()
  @MaxLength(180)
  public shortDescription!: string;
}
