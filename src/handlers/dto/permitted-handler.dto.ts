import { createZodDto } from "nestjs-zod";

import { handlerSchema } from "../schemas/handler.schema";

export class PermittedHandlerDto extends createZodDto(
  handlerSchema.omit({ authToken: true }),
) {}
