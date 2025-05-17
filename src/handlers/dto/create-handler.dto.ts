import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateHandlerDto {
  @ApiPropertyOptional({
    description:
      "The ID of the handler icon from https://icons8.com. Must be a valid icon ID.",
    example: "000000",
    maxLength: 12,
  })
  @IsOptional()
  @IsString()
  @MaxLength(12)
  public iconId?: string;

  @ApiPropertyOptional({
    description: "Whether the handler should be excluded from search results",
  })
  @IsBoolean()
  @IsOptional()
  public isSearchable?: boolean;

  @ApiPropertyOptional({
    description:
      "The long description of the handler. Used for detailed documentation of the handler's functionality.",
    example:
      "This handler is used for developing Discord bots. It allows you to create and manage Discord bots with ease.",
    maxLength: 5000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  public longDescription?: string;

  @ApiProperty({
    description:
      "The display name of the handler. Should be descriptive but concise.",
    example: "Discord (Bots)",
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  public name!: string;

  @ApiPropertyOptional({
    description:
      "A brief description of the handler's purpose. Used in listings and previews.",
    example: "Create and manage Discord bots",
    maxLength: 180,
  })
  @IsOptional()
  @IsString()
  @MaxLength(180)
  public shortDescription?: string;

  @ApiPropertyOptional({
    description: "Terms of using this handler",
    example:
      "By using this handler, you agree to follow our community guidelines and terms of service.",
    maxLength: 5000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  public terms?: string;
}
