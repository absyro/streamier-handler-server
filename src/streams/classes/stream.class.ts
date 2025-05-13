import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsObject,
  IsString,
  Length,
  MaxLength,
  ValidateNested,
} from "class-validator";

import { LogLevel } from "../enums/log-level.enum";
import { Log } from "./log.class";
import { Node } from "./node.class";

export class Stream {
  @ApiProperty({
    description: "The configuration of the stream",
    example: {
      someKey: "someValue",
    },
    required: true,
  })
  @IsObject()
  public configuration!: Record<string, unknown>;

  @ApiProperty({
    description: "The ID of the stream",
    example: "s1234567",
    maxLength: 8,
    minLength: 8,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @Length(8, 8)
  public id!: string;

  @ApiProperty({
    description: "Whether the stream is active",
    example: true,
    required: true,
  })
  @IsBoolean()
  public isActive!: boolean;

  @ApiProperty({
    description: "The logs of the stream",
    example: [
      {
        id: "l1234567",
        level: LogLevel.INFO,
        message: "Hello, world!",
        timestamp: "2021-01-01T00:00:00.000Z",
      },
    ],
    maxItems: 100,
    required: true,
    type: [Log],
  })
  @ArrayMaxSize(100)
  @IsArray()
  @Type(() => Log)
  @ValidateNested({ each: true })
  public logs!: Log[];

  @ApiProperty({
    description: "The name of the stream",
    example: "My Stream",
    maxLength: 100,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  public name!: string;

  @ApiProperty({
    description: "The nodes of the stream",
    example: [
      {
        data: {
          message: "Hello, world!",
        },
        id: "node-1",
        name: "Some Node",
        outputs: {
          someOutput: [1, 2, 3],
        },
      },
    ],
    maxItems: 1000,
    required: true,
    type: [Node],
  })
  @ArrayMaxSize(1000)
  @IsArray()
  @Type(() => Node)
  @ValidateNested({ each: true })
  public nodes!: Node[];

  @ApiProperty({
    description: "The signature of the stream",
    example: "abc123def456",
    maxLength: 500,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  public signature!: string;

  @ApiProperty({
    description: "The user ID of the stream",
    example: "u1234567",
    maxLength: 8,
    minLength: 8,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @Length(8, 8)
  public userId!: string;

  @ApiProperty({
    description: "The variables of the stream",
    example: {
      someVariable: "someValue",
    },
    required: true,
  })
  @IsObject()
  public variables!: Record<string, unknown>;
}
