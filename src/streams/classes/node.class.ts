import { ApiProperty } from "@nestjs/swagger";
import { IsObject, IsString, MaxLength } from "class-validator";

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
    example: "node-1",
    maxLength: 25,
    required: true,
  })
  @IsString()
  @MaxLength(25)
  public id!: string;

  @ApiProperty({
    description: "The name of the node",
    example: "Some Node",
    maxLength: 100,
    required: true,
  })
  @IsString()
  @MaxLength(100)
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
