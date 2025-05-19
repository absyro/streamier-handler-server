import { createZodDto } from "nestjs-zod";

import { streamSchema } from "../schemas/stream.schema";

export class UpdateStreamDto extends createZodDto(
  streamSchema
    .pick({
      configuration: true,
      isActive: true,
      name: true,
      nodes: true,
      permissions: true,
      roles: true,
      signature: true,
      variables: true,
    })
    .partial(),
) {}
