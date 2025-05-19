import { createZodDto } from "nestjs-zod";

import { searchHandlerSchema } from "../schemas/search-handler.schema";

export class SearchHandlerDto extends createZodDto(searchHandlerSchema) {}
