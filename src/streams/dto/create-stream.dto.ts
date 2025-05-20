import { createZodDto } from "nestjs-zod";

import { streamSchema } from "../schemas/stream.schema";

export class CreateStreamDto extends createZodDto(
  streamSchema.pick({ configuration: true, handlerId: true, name: true }),
) {}
