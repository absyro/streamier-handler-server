import { createZodDto } from "nestjs-zod";
import zodDeepPartial from "zod-deep-partial";

import { streamSchema } from "../schemas/stream.schema";

export class DeepPartialStreamDto extends createZodDto(
  zodDeepPartial(streamSchema),
) {}
