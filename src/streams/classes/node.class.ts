import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsPositive,
  IsString,
} from "class-validator";

export class Node {
  @ApiProperty({
    description: "The data of the node",
    example: {
      message: "Hello, world!",
    },
    required: true,
  })
  @IsObject()
  public data!: Record<string, unknown>;

  @ApiProperty({
    description: "The ID of the node",
    example: 1,
    required: true,
  })
  @IsNumber()
  @IsPositive()
  public id!: number;

  @ApiProperty({
    description: "The name of the node",
    example: "Some Node",
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  public name!: string;

  @ApiProperty({
    description: "The outputs of the node",
    example: {
      someOutput: [1, 2, 3],
    },
    required: true,
  })
  @IsObject()
  public outputs!: Record<string, number[]>;
}
