import { createZodDto } from "nestjs-zod";

import { StreamSchema } from "../schemas/stream.schema";

export class UpdateStreamDto extends createZodDto(
  StreamSchema.pick({
    configuration: true,
    isActive: true,
    name: true,
    nodes: true,
    signature: true,
    variables: true,
    visibility: true,
  }).partial(),
) {}
