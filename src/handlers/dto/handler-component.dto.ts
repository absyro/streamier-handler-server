import { createZodDto } from "nestjs-zod";

import { handlerComponentSchema } from "../schemas/handler-component.schema";

export class HandlerComponentDto extends createZodDto(handlerComponentSchema) {}
