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
  @IsNotEmpty()
  @IsString()
  @Length(8, 8)
  public id!: string;

  @IsEnum(LogLevel)
  public level!: LogLevel;

  @IsNotEmpty()
  @IsString()
  @MaxLength(1024)
  public message!: string;

  @IsISO8601()
  @IsNotEmpty()
  @IsString()
  public timestamp!: string;
}
