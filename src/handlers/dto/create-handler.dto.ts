import { ApiProperty } from "@nestjs/swagger";
import { IsString, MaxLength } from "class-validator";

/**
 * Data Transfer Object for creating a new handler.
 *
 * Defines the required fields and validation rules for creating a new handler.
 * All fields are required and have specific length and format constraints.
 *
 * @class CreateHandlerDto
 * @property {string} iconId - The ID of the handler icon from icons8.com
 * @property {string} longDescription - Detailed description of handler
 *   functionality
 * @property {string} name - Display name of the handler
 * @property {string} shortDescription - Brief description of handler purpose
 */
export class CreateHandlerDto {
  /**
   * The ID of the handler icon from icons8.com.
   *
   * Must be a valid icon ID from icons8.com. Maximum length is 12 characters.
   *
   * @property {string} iconId
   */
  @ApiProperty({
    description:
      "The ID of the handler icon from icons8.com. Must be a valid icon ID.",
    example: "000000",
    maxLength: 12,
    required: true,
  })
  @IsString()
  @MaxLength(12)
  public iconId!: string;

  /**
   * Detailed description of the handler's functionality.
   *
   * Used for detailed documentation of the handler's functionality. Maximum
   * length is 5000 characters.
   *
   * @property {string} longDescription
   */
  @ApiProperty({
    description:
      "The long description of the handler. Used for detailed documentation of the handler's functionality.",
    example:
      "This handler is used for developing Discord bots. It allows you to create and manage Discord bots with ease.",
    maxLength: 5000,
    required: true,
  })
  @IsString()
  @MaxLength(5000)
  public longDescription!: string;

  /**
   * Display name of the handler.
   *
   * Should be descriptive but concise. Maximum length is 100 characters.
   *
   * @property {string} name
   */
  @ApiProperty({
    description:
      "The display name of the handler. Should be descriptive but concise.",
    example: "Discord (Bots)",
    maxLength: 100,
    required: true,
  })
  @IsString()
  @MaxLength(100)
  public name!: string;

  /**
   * Brief description of the handler's purpose.
   *
   * Used in listings and previews. Maximum length is 180 characters.
   *
   * @property {string} shortDescription
   */
  @ApiProperty({
    description:
      "A brief description of the handler's purpose. Used in listings and previews.",
    example: "Create and manage Discord bots",
    maxLength: 180,
    required: true,
  })
  @IsString()
  @MaxLength(180)
  public shortDescription!: string;
}
