import { ApiProperty } from "@nestjs/swagger";
import {
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsString,
  Length,
  MaxLength,
} from "class-validator";

import { LogLevel } from "../enums/log-level.enum";

export class LogEntry {
  @ApiProperty({
    description: "The ID of the log entry",
    example: "l1234567",
    maxLength: 8,
    minLength: 8,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @Length(8, 8)
  public id!: string;

  @ApiProperty({
    description: "The level of the log entry",
    enum: LogLevel,
    example: LogLevel.INFO,
    required: true,
  })
  @IsEnum(LogLevel)
  public level!: LogLevel;

  @ApiProperty({
    description: "The message of the log entry",
    example: "This is a log message",
    maxLength: 1024,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(1024)
  public message!: string;

  @ApiProperty({
    description: "The timestamp of the log entry",
    example: "2021-01-01T00:00:00.000Z",
    required: true,
    type: Date,
  })
  @IsISO8601()
  @IsNotEmpty()
  @IsString()
  public timestamp!: string;
}
