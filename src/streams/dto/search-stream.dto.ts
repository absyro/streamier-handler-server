import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export class SearchStreamDto extends createZodDto(
  z.object({
    createdDaysAgo: z
      .string()
      .regex(/^[0-9]+$/u, "createdDaysAgo must be a positive number")
      .optional()
      .describe("Filter streams created within the specified number of days"),
    handlerId: z
      .string()
      .length(8)
      .optional()
      .describe("Filter by specific handler ID"),
    isActive: z
      .enum(["true", "false"])
      .optional()
      .describe("Filter by active status"),
    limit: z
      .string()
      .regex(
        /^(?<limit>[1-9]|[1-9][0-9]|100)$/u,
        "limit must be a number between 1 and 100",
      )
      .optional()
      .default("20")
      .describe("Maximum number of results to return"),
    offset: z
      .string()
      .regex(
        /^(?<offset>[0-9]|[1-9][0-9]{1,2}|1000)$/u,
        "offset must be a non-negative number between 0 and 1000",
      )
      .optional()
      .default("0")
      .describe("Number of results to skip (max 1000)"),
    q: z
      .string()
      .nonempty()
      .max(100)
      .optional()
      .describe("Search query string to match against stream name"),
    updatedDaysAgo: z
      .string()
      .regex(/^[0-9]+$/u, "updatedDaysAgo must be a positive number")
      .optional()
      .describe("Filter streams updated within the specified number of days"),
    userId: z
      .string()
      .length(8)
      .optional()
      .describe("Filter by specific user ID"),
  }),
) {}
