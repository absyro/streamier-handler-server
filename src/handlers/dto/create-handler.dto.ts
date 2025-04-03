import { IsOptional, IsString, MaxLength } from "class-validator";

export class CreateHandlerDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  public iconId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  public longDescription?: string;

  @IsString()
  @MaxLength(25)
  public name: string;

  @IsString()
  @MaxLength(180)
  public shortDescription: string;
}
