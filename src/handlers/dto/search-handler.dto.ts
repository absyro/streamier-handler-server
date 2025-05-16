import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, Matches } from "class-validator";

export class SearchHandlerDto {
  @ApiPropertyOptional({
    description: "Filter by online status",
  })
  @IsOptional()
  @IsString()
  @Matches(/^(?<bool>true|false)$/u, {
    message: "isOnline must be 'true' or 'false'",
  })
  public isOnline?: string;

  @ApiPropertyOptional({
    default: "20",
    description: "Maximum number of results to return",
  })
  @IsOptional()
  @IsString()
  @Matches(/^(?<limit>[1-9]|[1-9][0-9]|100)$/u, {
    message: "limit must be a number between 1 and 100",
  })
  public limit?: string = "20";

  @ApiPropertyOptional({
    default: "0",
    description: "Number of results to skip (max 1000)",
  })
  @IsOptional()
  @IsString()
  @Matches(/^(?<offset>[0-9]|[1-9][0-9]{1,2}|1000)$/u, {
    message: "offset must be a non-negative number between 0 and 1000",
  })
  public offset?: string = "0";

  @ApiPropertyOptional({
    description: "Search query string to match against handler parameters",
  })
  @IsOptional()
  @IsString()
  public q?: string;

  @ApiPropertyOptional({
    description: "Filter by specific user ID",
  })
  @IsOptional()
  @IsString()
  public userId?: string;
}
