import { PickType } from "@nestjs/swagger";

import { StreamDto } from "../schemas/stream.schema";

export class StreamConfigurationResponse extends PickType(StreamDto, [
  "configuration",
]) {}
