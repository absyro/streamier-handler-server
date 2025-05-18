import { PartialType, PickType } from "@nestjs/swagger";

import { Stream } from "../classes/stream.class";

export class UpdateStreamDto extends PartialType(
  PickType(Stream, [
    "configuration",
    "isActive",
    "name",
    "nodes",
    "signature",
    "variables",
    "visibility",
  ]),
) {}
