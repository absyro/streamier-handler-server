import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { dedent } from "ts-dedent";

export class ListStreamsDto {
  @ApiProperty({
    description: dedent`
    The fields to include in the response.

    Uses json-mask to select the fields to include in the response.

    See https://github.com/nemtsov/json-mask for more information.

    If not provided, all fields should be included.`,
    example: "id,name,configuration(something)",
    required: false,
  })
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  public fields?: string;
}
