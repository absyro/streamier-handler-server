import { PickType } from "@nestjs/swagger";

import { StreamDto } from "../schemas/stream.schema";

export class StreamVariablesResponse extends PickType(StreamDto, [
  "variables",
]) {}
