import { createZodDto } from "nestjs-zod";

import { streamSchema } from "../schemas/stream.schema";

export class StreamDto extends createZodDto(streamSchema) {}
