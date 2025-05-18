import { createZodDto } from "nestjs-zod";

import { CreateHandlerSchema } from "./create-handler.dto";

export class UpdateHandlerDto extends createZodDto(
  CreateHandlerSchema.partial(),
) {}
