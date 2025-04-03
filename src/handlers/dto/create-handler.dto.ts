import { IsString, MaxLength, IsOptional } from "class-validator";

export class CreateHandlerDto {
  @IsString()
  @MaxLength(25)
  name: string;

  @IsString()
  @MaxLength(180)
  shortDescription: string;

  @IsString()
  @MaxLength(1000)
  @IsOptional()
  longDescription?: string;

  @IsString()
  @MaxLength(50)
  @IsOptional()
  iconId?: string;
}
