import {
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsPositive,
  IsString,
} from "class-validator";

export class Node {
  @IsObject()
  public data!: Record<string, unknown>;

  @IsNumber()
  @IsPositive()
  public id!: number;

  @IsNotEmpty()
  @IsString()
  public name!: string;

  @IsObject()
  public outputs!: Record<string, number[]>;
}
