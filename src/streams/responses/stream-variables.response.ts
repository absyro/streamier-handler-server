import { createZodDto } from "nestjs-zod";

import { StreamSchema } from "../schemas/stream.schema";

export class StreamVariablesResponse extends createZodDto(
  StreamSchema.pick({ variables: true }),
) {}
