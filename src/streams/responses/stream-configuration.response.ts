import { createZodDto } from "nestjs-zod";

import { StreamSchema } from "../schemas/stream.schema";

export class StreamConfigurationResponse extends createZodDto(
  StreamSchema.pick({ configuration: true }),
) {}
