import { OmitType } from "@nestjs/swagger";

import { Stream } from "../classes/stream.class";

export class PublicStreamResponse extends OmitType(Stream, [
  "configuration",
  "logs",
  "signature",
  "variables",
]) {}
