import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export class StreamConfigurationSchemaResponse extends createZodDto(
  z.object({
    schema: z
      .record(z.unknown())
      .describe(
        "The configuration schema of the stream. This data will not be validated on the server side. See https://json-schema.org/draft-07",
      ),
  }),
) {}
