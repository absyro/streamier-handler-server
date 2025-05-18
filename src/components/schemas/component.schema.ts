import { createZodDto } from "nestjs-zod";
import { z } from "zod";

const snakeCaseRegex = /^[a-z]+(?:_[a-z]+)*$/u;

export const ComponentSchema = z.object({
  category: z
    .string()
    .nonempty()
    .max(25)
    .regex(snakeCaseRegex, {
      message: "category must be in snake_case",
    })
    .optional()
    .describe("The category this component belongs to."),
  description: z
    .string()
    .nonempty()
    .max(100)
    .optional()
    .describe("Brief description of the component's purpose."),
  documentation: z
    .string()
    .nonempty()
    .max(5000)
    .optional()
    .describe("Detailed documentation for the component in Markdown format."),
  iconId: z
    .string()
    .nonempty()
    .max(12)
    .optional()
    .describe("Visual icon identifier from Icons8. See https://icons8.com"),
  name: z
    .string()
    .nonempty()
    .max(100)
    .regex(snakeCaseRegex, {
      message: "name must be in snake_case",
    })
    .describe("The name of the component."),
  nodeDataSchema: z
    .record(z.unknown())
    .optional()
    .describe(
      "The schema of the node data. This data will not be validated on the server side. See https://www.npmjs.com/package/zod-to-json-schema#expected-output",
    ),
  outputSchema: z
    .record(z.unknown())
    .optional()
    .describe(
      "The schema of the output data. This data will not be validated on the server side. See https://www.npmjs.com/package/zod-to-json-schema#expected-output",
    ),
  variablesSchema: z
    .record(z.unknown())
    .optional()
    .describe(
      "The schema of the variables. This data will not be validated on the server side. See https://www.npmjs.com/package/zod-to-json-schema#expected-output",
    ),
});

export class ComponentDto extends createZodDto(ComponentSchema) {}
