import { HttpStatus } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export class UnauthorizedResponseDto extends createZodDto(
  z.object({
    error: z.literal("Unauthorized"),
    message: z.string(),
    statusCode: z.literal(HttpStatus.UNAUTHORIZED),
  }),
) {}
