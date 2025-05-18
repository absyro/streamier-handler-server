import { PartialType, PickType } from "@nestjs/swagger";

import { StreamDto } from "../schemas/stream.schema";

export class UpdateStreamDto extends PartialType(
  PickType(StreamDto, [
    "configuration",
    "isActive",
    "name",
    "nodes",
    "signature",
    "variables",
    "visibility",
  ]),
) {}
