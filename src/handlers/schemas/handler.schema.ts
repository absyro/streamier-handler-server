import { z } from "zod";

export const handlerSchema = z.object({
  authToken: z
    .string()
    .length(64)
    .describe("Authentication token used for authentication"),
  createdAt: z
    .string()
    .datetime()
    .describe("Timestamp when the handler was created"),
  iconId: z
    .string()
    .nonempty()
    .max(12)
    .optional()
    .describe("The ID of the handler icon from https://icons8.com"),
  id: z.string().length(8).describe("Unique identifier for the handler"),
  isActive: z
    .boolean()
    .describe("Whether the handler is currently active and connected"),
  isSearchable: z
    .boolean()
    .describe("Whether the handler should be included in search results"),
  longDescription: z
    .string()
    .nonempty()
    .max(5000)
    .optional()
    .describe("Detailed description of the handler's functionality"),
  name: z.string().nonempty().max(100).describe("Display name of the handler"),
  shortDescription: z
    .string()
    .nonempty()
    .max(200)
    .optional()
    .describe("Brief description of the handler's purpose"),
  terms: z
    .string()
    .nonempty()
    .max(5000)
    .optional()
    .describe("Terms of using this handler"),
  updatedAt: z
    .string()
    .datetime()
    .describe("Timestamp when the handler was last updated"),
  userId: z.string().length(8).describe("ID of the user who owns this handler"),
});

export type HandlerSchema = z.infer<typeof handlerSchema>;
