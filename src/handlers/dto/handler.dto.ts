import { createZodDto } from "nestjs-zod";

import { handlerSchema } from "../schemas/handler.schema";

export class HandlerDto extends createZodDto(handlerSchema) {}
