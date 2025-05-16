import { PickType } from "@nestjs/swagger";

import { Stream } from "../classes/stream.class";

export class StreamLogsResponse extends PickType(Stream, ["logs"]) {}
