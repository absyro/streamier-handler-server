import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from "class-validator";

export class Component {
  @ApiPropertyOptional({
    description: "The category this component belongs to.",
    example: "http_handlers",
    maxLength: 25,
  })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z]+(?:_[a-z]+)*$/u, {
    message: "category must be in snake_case",
  })
  @MaxLength(25)
  public category?: string;

  @ApiPropertyOptional({
    description: "Brief description of the component's purpose.",
    example: "Send a message to a user.",
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  public description?: string;

  @ApiPropertyOptional({
    description: "Detailed documentation for the component in Markdown format.",
    example:
      "## Send a message to a user\n\nThis component sends a message to a user.",
    maxLength: 5000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  public documentation?: string;

  @ApiPropertyOptional({
    description: "Visual icon identifier from Icons8. See https://icons8.com",
    maxLength: 12,
  })
  @IsOptional()
  @IsString()
  @MaxLength(12)
  public iconId?: string;

  @ApiProperty({
    description: "The name of the component.",
    example: "send_message",
    maxLength: 100,
  })
  @IsString()
  @Matches(/^[a-z]+(?:_[a-z]+)*$/u, {
    message: "name must be in snake_case",
  })
  @MaxLength(100)
  public name!: string;

  @ApiPropertyOptional({
    description:
      "The schema of the node data. This data will not be validated on the server side. See https://www.npmjs.com/package/zod-to-json-schema#expected-output",
  })
  @IsObject()
  @IsOptional()
  public nodeDataSchema?: object;

  @ApiPropertyOptional({
    description:
      "The schema of the output data. This data will not be validated on the server side. See https://www.npmjs.com/package/zod-to-json-schema#expected-output",
  })
  @IsObject()
  @IsOptional()
  public outputSchema?: object;

  @ApiPropertyOptional({
    description:
      "The schema of the variables. This data will not be validated on the server side. See https://www.npmjs.com/package/zod-to-json-schema#expected-output",
  })
  @IsObject()
  @IsOptional()
  public variablesSchema?: object;
}
