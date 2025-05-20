import { HttpStatus } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export class NotFoundResponseDto extends createZodDto(
  z.object({
    error: z.literal("Not Found"),
    message: z.string(),
    statusCode: z.literal(HttpStatus.NOT_FOUND),
  }),
) {}
