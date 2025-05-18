import { OmitType } from "@nestjs/swagger";

import { StreamDto } from "../schemas/stream.schema";

export class PublicStreamResponse extends OmitType(StreamDto, [
  "configuration",
  "logs",
  "signature",
  "variables",
]) {}
