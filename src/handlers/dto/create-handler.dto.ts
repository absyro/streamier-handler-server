import { IsString, MaxLength } from "class-validator";

export class CreateHandlerDto {
  @IsString()
  @MaxLength(50)
  public iconId: string;

  @IsString()
  @MaxLength(1000)
  public longDescription: string;

  @IsString()
  @MaxLength(100)
  public name: string;

  @IsString()
  @MaxLength(180)
  public shortDescription: string;
}
