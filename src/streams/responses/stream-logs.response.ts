import { createZodDto } from "nestjs-zod";

import { StreamSchema } from "../schemas/stream.schema";

export class StreamLogsResponse extends createZodDto(
  StreamSchema.pick({ logs: true }),
) {}
