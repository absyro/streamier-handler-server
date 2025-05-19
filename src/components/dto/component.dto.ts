import { createZodDto } from "nestjs-zod";

import { componentSchema } from "../schemas/component.schema";

export class ComponentDto extends createZodDto(componentSchema) {}
