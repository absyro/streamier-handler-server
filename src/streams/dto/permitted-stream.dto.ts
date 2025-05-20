import { createZodDto } from "nestjs-zod";

import { streamSchema } from "../schemas/stream.schema";

export class PermittedStreamDto extends createZodDto(streamSchema.partial()) {}
