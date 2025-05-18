import { createZodDto } from "nestjs-zod";

import { StreamSchema } from "../schemas/stream.schema";

export class StreamSignatureResponse extends createZodDto(
  StreamSchema.pick({ signature: true }),
) {}
