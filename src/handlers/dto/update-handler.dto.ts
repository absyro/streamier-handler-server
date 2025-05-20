import { createZodDto } from "nestjs-zod";

import { handlerSchema } from "../schemas/handler.schema";

export class UpdateHandlerDto extends createZodDto(
  handlerSchema
    .pick({
      iconId: true,
      isActive: true,
      isSearchable: true,
      longDescription: true,
      name: true,
      shortDescription: true,
      terms: true,
    })
    .partial()
    .strict(),
) {}
