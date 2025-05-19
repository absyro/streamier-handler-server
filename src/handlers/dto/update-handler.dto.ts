import { createZodDto } from "nestjs-zod";

import { createHandlerSchema } from "../schemas/create-handler.schema";

export class UpdateHandlerDto extends createZodDto(
  createHandlerSchema.partial(),
) {}
