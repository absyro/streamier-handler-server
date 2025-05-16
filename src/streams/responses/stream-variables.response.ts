import { PickType } from "@nestjs/swagger";

import { Stream } from "../classes/stream.class";

export class StreamVariablesResponse extends PickType(Stream, ["variables"]) {}
