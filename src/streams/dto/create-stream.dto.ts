import { createZodDto } from "nestjs-zod";

import { StreamSchema } from "../schemas/stream.schema";

export class CreateStreamDto extends createZodDto(
  StreamSchema.pick({ configuration: true, name: true, visibility: true }),
) {}
