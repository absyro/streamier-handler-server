import { HttpStatus } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export class InternalServerErrorResponseDto extends createZodDto(
  z.object({
    error: z.literal("Internal server error"),
    message: z.string(),
    statusCode: z.literal(HttpStatus.INTERNAL_SERVER_ERROR),
  }),
) {}
