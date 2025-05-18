import { PickType } from "@nestjs/swagger";

import { StreamDto } from "../schemas/stream.schema";

export class StreamSignatureResponse extends PickType(StreamDto, [
  "signature",
]) {}
