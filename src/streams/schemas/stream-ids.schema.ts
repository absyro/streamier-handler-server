import { z } from "zod";

import { streamSchema } from "./stream.schema";

export const streamIdsSchema = z
  .array(streamSchema.shape.id)
  .max(100)
  .describe("List of stream IDs");
