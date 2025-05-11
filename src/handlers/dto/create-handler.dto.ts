import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateHandlerDto {
  @ApiProperty({
    description:
      "The ID of the handler icon from icons8.com. Must be a valid icon ID.",
    example: "000000",
    maxLength: 12,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(12)
  public iconId!: string;

  @ApiProperty({
    description:
      "The long description of the handler. Used for detailed documentation of the handler's functionality.",
    example:
      "This handler is used for developing Discord bots. It allows you to create and manage Discord bots with ease.",
    maxLength: 5000,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(5000)
  public longDescription!: string;

  @ApiProperty({
    description:
      "The display name of the handler. Should be descriptive but concise.",
    example: "Discord (Bots)",
    maxLength: 100,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  public name!: string;

  @ApiProperty({
    description:
      "A brief description of the handler's purpose. Used in listings and previews.",
    example: "Create and manage Discord bots",
    maxLength: 180,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(180)
  public shortDescription!: string;
}
