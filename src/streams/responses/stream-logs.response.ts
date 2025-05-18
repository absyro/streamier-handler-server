import { PickType } from "@nestjs/swagger";

import { StreamDto } from "../schemas/stream.schema";

export class StreamLogsResponse extends PickType(StreamDto, ["logs"]) {}
