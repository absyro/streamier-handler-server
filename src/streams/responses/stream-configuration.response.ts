import { PickType } from "@nestjs/swagger";

import { Stream } from "../classes/stream.class";

export class StreamConfigurationResponse extends PickType(Stream, [
  "configuration",
]) {}
