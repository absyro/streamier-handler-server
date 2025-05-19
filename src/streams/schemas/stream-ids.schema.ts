import { z } from "zod";

export const streamIdsSchema = z.object({
  streamIds: z
    .array(z.string().length(8).describe("8-character stream ID"))
    .max(100)
    .describe("List of stream IDs"),
});
