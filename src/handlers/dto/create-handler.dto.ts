import { createZodDto } from "nestjs-zod";

import { handlerSchema } from "../schemas/handler.schema";

export class CreateHandlerDto extends createZodDto(
  handlerSchema.pick({ name: true }),
) {}
