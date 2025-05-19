import { createZodDto } from "nestjs-zod";

import { streamConfigurationSchemaSchema } from "../schemas/stream-configuration-schema.schema";

export class StreamsConfigurationSchemaDto extends createZodDto(
  streamConfigurationSchemaSchema,
) {}
