import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";

/**
 * Data Transfer Object for searching handlers.
 *
 * Defines the search parameters and filters for finding handlers. All fields
 * are optional and have specific validation rules.
 *
 * @class SearchHandlerDto
 * @property {number} limit - Maximum number of results to return
 * @property {number} maxTags - Maximum number of tags a handler should have
 * @property {number} minTags - Minimum number of tags a handler should have
 * @property {number} offset - Number of results to skip (for pagination)
 * @property {string} q - Search query string
 * @property {string[]} tags - Filter by specific tags
 * @property {boolean} isOnline - Filter by online status
 */
export class SearchHandlerDto {
  /**
   * Filter by online status.
   *
   * Used to find handlers that are either online or offline.
   *
   * @property {boolean} isOnline
   */
  @ApiProperty({
    description: "Filter by online status",
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  public isOnline?: boolean;

  /**
   * Maximum number of results to return.
   *
   * Defaults to 20. Must be between 1 and 100.
   *
   * @property {number} limit
   */
  @ApiProperty({
    default: 20,
    description: "Maximum number of results to return",
    maximum: 100,
    minimum: 1,
    required: false,
  })
  @IsInt()
  @IsOptional()
  @Max(100)
  @Min(1)
  @Type(() => Number)
  public limit?: number = 20;

  /**
   * Maximum number of tags a handler should have.
   *
   * Must be greater than or equal to 1. Used to filter handlers with too many
   * tags.
   *
   * @property {number} maxTags
   */
  @ApiProperty({
    description: "Maximum number of tags a handler should have",
    maximum: 10,
    minimum: 1,
    required: false,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  public maxTags?: number;

  /**
   * Minimum number of tags a handler should have.
   *
   * Must be greater than or equal to 1. Used to filter handlers with too few
   * tags.
   *
   * @property {number} minTags
   */
  @ApiProperty({
    description: "Minimum number of tags a handler should have",
    maximum: 10,
    minimum: 1,
    required: false,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  public minTags?: number;

  /**
   * Number of results to skip.
   *
   * Used for pagination. Defaults to 0. Must be greater than or equal to 0.
   *
   * @property {number} offset
   */
  @ApiProperty({
    default: 0,
    description: "Number of results to skip",
    minimum: 0,
    required: false,
  })
  @IsInt()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  public offset?: number = 0;

  /**
   * Search query string.
   *
   * Used to search across handler name, description, and tags. Case-insensitive
   * partial matching.
   *
   * @property {string} q
   */
  @ApiProperty({
    description:
      "Search query string to match against name, description, and tags",
    required: false,
  })
  @IsOptional()
  @IsString()
  public q?: string;

  /**
   * Filter by specific tags.
   *
   * Array of tags to filter handlers. Handlers must have all specified tags to
   * match.
   *
   * @property {string[]} tags
   */
  @ApiProperty({
    description: "Filter by specific tags",
    required: false,
    type: [String],
  })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  public tags?: string[];

  /**
   * Filter by specific user ID.
   *
   * Used to find handlers belonging to a specific user.
   *
   * @property {string} userId
   */
  @ApiProperty({
    description: "Filter by specific user ID",
    required: false,
  })
  @IsOptional()
  @IsString()
  public userId?: string;
}
