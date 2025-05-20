import { HttpStatus } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export class ForbiddenResponseDto extends createZodDto(
  z.object({
    error: z.literal("Forbidden"),
    message: z.string(),
    statusCode: z.literal(HttpStatus.FORBIDDEN),
  }),
) {}
