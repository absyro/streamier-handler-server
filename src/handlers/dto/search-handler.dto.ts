import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, Matches } from "class-validator";

/**
 * Data Transfer Object for searching handlers.
 *
 * Defines the search parameters and filters for finding handlers. All fields
 * are optional and have specific validation rules.
 *
 * @class SearchHandlerDto
 * @property {string} limit - Maximum number of results to return
 * @property {string} offset - Number of results to skip (for pagination)
 * @property {string} q - Search query string
 * @property {string} isOnline - Filter by online status
 */
export class SearchHandlerDto {
  /**
   * Filter by online status.
   *
   * Used to find handlers that are either online or offline.
   *
   * @property {string} isOnline
   */
  @ApiProperty({
    description: "Filter by online status",
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^(?<bool>true|false)$/u, {
    message: "isOnline must be 'true' or 'false'",
  })
  public isOnline?: string;

  /**
   * Maximum number of results to return.
   *
   * Defaults to 20. Must be between 1 and 100.
   *
   * @property {string} limit
   */
  @ApiProperty({
    default: "20",
    description: "Maximum number of results to return",
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^(?<limit>[1-9]|[1-9][0-9]|100)$/u, {
    message: "limit must be a number between 1 and 100",
  })
  public limit?: string = "20";

  /**
   * Number of results to skip.
   *
   * Used for pagination. Defaults to 0. Must be greater than or equal to 0 and
   * less than or equal to 1000.
   *
   * @property {string} offset
   */
  @ApiProperty({
    default: "0",
    description: "Number of results to skip (max 1000)",
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^(?<offset>[0-9]|[1-9][0-9]{1,2}|1000)$/u, {
    message: "offset must be a non-negative number between 0 and 1000",
  })
  public offset?: string = "0";

  /**
   * Search query string.
   *
   * Used to search across handler parameters. Case-insensitive partial
   * matching.
   *
   * @property {string} q
   */
  @ApiProperty({
    description: "Search query string to match against handler parameters",
    required: false,
  })
  @IsOptional()
  @IsString()
  public q?: string;

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
