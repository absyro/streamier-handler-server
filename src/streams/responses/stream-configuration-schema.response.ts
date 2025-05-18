import { ApiProperty } from "@nestjs/swagger";
import { IsObject } from "class-validator";

export class StreamConfigurationSchemaResponse {
  @ApiProperty({
    description:
      "The configuration schema of the stream. This data will not be validated on the server side. See https://www.npmjs.com/package/zod-to-json-schema#expected-output",
  })
  @IsObject()
  public schema!: object;
}
