import { createZodDto } from "nestjs-zod";

import { streamSchema } from "../schemas/stream.schema";

export class PartialStreamDto extends createZodDto(streamSchema.partial()) {}
