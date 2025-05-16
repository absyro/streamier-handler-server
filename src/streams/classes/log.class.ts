import { ApiProperty } from "@nestjs/swagger";
import {
  IsEnum,
  IsISO8601,
  IsString,
  Length,
  MaxLength,
} from "class-validator";

import { LogLevel } from "../enums/log-level.enum";

export class Log {
  @ApiProperty({
    description: "The ID of the log",
    example: "l1234567",
    maxLength: 8,
    minLength: 8,
  })
  @IsString()
  @Length(8, 8)
  public id!: string;

  @ApiProperty({
    description: "The level of the log",
    enum: LogLevel,
    example: LogLevel.INFO,
  })
  @IsEnum(LogLevel)
  public level!: LogLevel;

  @ApiProperty({
    description: "The message of the log",
    example: "This is a log message",
    maxLength: 1000,
  })
  @IsString()
  @MaxLength(1000)
  public message!: string;

  @ApiProperty({
    description: "The timestamp of the log",
    example: "2021-01-01T00:00:00.000Z",
    type: Date,
  })
  @IsISO8601()
  @IsString()
  public timestamp!: string;
}
