import { PickType } from "@nestjs/swagger";

import { StreamDto } from "../schemas/stream.schema";

export class CreateStreamDto extends PickType(StreamDto, [
  "configuration",
  "name",
  "visibility",
]) {}
