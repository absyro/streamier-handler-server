import { PickType } from "@nestjs/swagger";

import { Stream } from "../classes/stream.class";

export class CreateStreamDto extends PickType(Stream, [
  "configuration",
  "name",
]) {}
