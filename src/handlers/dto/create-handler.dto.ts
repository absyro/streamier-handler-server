import { createZodDto } from "nestjs-zod";

import { createHandlerSchema } from "../schemas/create-handler.schema";

export class CreateHandlerDto extends createZodDto(createHandlerSchema) {}
