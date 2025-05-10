import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsObject,
  IsString,
  Length,
  MaxLength,
  ValidateNested,
} from "class-validator";

import { LogEntry } from "./log-entry.class";
import { Node } from "./node.class";

export class Stream {
  @IsObject()
  public configuration!: Record<string, unknown>;

  @IsNotEmpty()
  @IsString()
  @Length(8, 8)
  public id!: string;

  @IsBoolean()
  public isActive!: boolean;

  @IsArray()
  @Type(() => LogEntry)
  @ValidateNested({ each: true })
  public logs!: LogEntry[];

  @IsNotEmpty()
  @IsString()
  @MaxLength(128)
  public name!: string;

  @IsArray()
  @Type(() => Node)
  @ValidateNested({ each: true })
  public nodes!: Node[];

  @IsNotEmpty()
  @IsString()
  @MaxLength(512)
  public signature!: string;

  @IsNotEmpty()
  @IsString()
  @Length(8, 8)
  public userId!: string;

  @IsObject()
  public variables!: Record<string, unknown>;
}
