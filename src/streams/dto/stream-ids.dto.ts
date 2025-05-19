import { createZodDto } from "nestjs-zod";

import { streamIdsSchema } from "../schemas/stream-ids.schema";

export class StreamIdsDto extends createZodDto(streamIdsSchema) {}
