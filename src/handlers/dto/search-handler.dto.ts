import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";

export class SearchHandlerDto {
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

  @ApiProperty({
    description: "Maximum number of tags a handler should have",
    maximum: 10,
    minimum: 1,
    required: false,
  })
  @IsInt()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  public maxTags?: number;

  @ApiProperty({
    description: "Minimum number of tags a handler should have",
    maximum: 10,
    minimum: 1,
    required: false,
  })
  @IsInt()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  public minTags?: number;

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

  @ApiProperty({
    description:
      "Search query string to match against name, description, and tags",
    required: false,
  })
  @IsOptional()
  @IsString()
  public q?: string;

  @ApiProperty({
    description: "Filter by specific tags",
    required: false,
    type: [String],
  })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  public tags?: string[];
}
