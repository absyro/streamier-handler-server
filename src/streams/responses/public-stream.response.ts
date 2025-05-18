import { createZodDto } from "nestjs-zod";

import { StreamSchema } from "../schemas/stream.schema";

export class PublicStreamResponse extends createZodDto(
  StreamSchema.omit({
    configuration: true,
    logs: true,
    signature: true,
    variables: true,
  }),
) {}
