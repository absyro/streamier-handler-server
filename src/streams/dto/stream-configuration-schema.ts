import { createZodDto } from "nestjs-zod";

import { streamConfigurationSchemaSchema } from "../schemas/stream-configuration-schema.schema";

export class StreamConfigurationSchemaDto extends createZodDto(
  streamConfigurationSchemaSchema,
) {}
