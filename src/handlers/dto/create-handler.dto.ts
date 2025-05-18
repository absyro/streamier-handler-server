import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const CreateHandlerSchema = z.object({
  iconId: z
    .string()
    .nonempty()
    .max(12)
    .optional()
    .describe(
      "The ID of the handler icon from https://icons8.com. Must be a valid icon ID.",
    ),
  isSearchable: z
    .boolean()
    .optional()
    .describe("Whether the handler should be excluded from search results"),
  longDescription: z
    .string()
    .nonempty()
    .max(5000)
    .optional()
    .describe(
      "The long description of the handler. Used for detailed documentation of the handler's functionality.",
    ),
  name: z
    .string()
    .nonempty()
    .max(100)
    .describe(
      "The display name of the handler. Should be descriptive but concise.",
    ),
  shortDescription: z
    .string()
    .nonempty()
    .max(180)
    .optional()
    .describe(
      "A brief description of the handler's purpose. Used in listings and previews.",
    ),
  terms: z
    .string()
    .nonempty()
    .max(5000)
    .optional()
    .describe("Terms of using this handler"),
});

export class CreateHandlerDto extends createZodDto(CreateHandlerSchema) {}
