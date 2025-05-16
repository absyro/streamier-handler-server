import { PickType } from "@nestjs/swagger";

import { Stream } from "../classes/stream.class";

export class StreamSignatureResponse extends PickType(Stream, ["signature"]) {}
