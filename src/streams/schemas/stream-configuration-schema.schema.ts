import { z } from "zod";

export const streamConfigurationSchemaSchema = z.object({
  schema: z
    .record(z.unknown())
    .describe(
      "The configuration schema of the stream. This data will not be validated on the server side. See https://json-schema.org/draft-07",
    ),
});
