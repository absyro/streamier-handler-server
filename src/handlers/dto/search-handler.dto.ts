import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, Matches } from "class-validator";

export class SearchHandlerDto {
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

  @ApiProperty({
    description: "Search query string to match against handler parameters",
    required: false,
  })
  @IsOptional()
  @IsString()
  public q?: string;

  @ApiProperty({
    description: "Filter by specific user ID",
    required: false,
  })
  @IsOptional()
  @IsString()
  public userId?: string;
}
