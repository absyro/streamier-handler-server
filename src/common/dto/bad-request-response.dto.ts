import { HttpStatus } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export class BadRequestResponseDto extends createZodDto(
  z.object({
    error: z.literal("Bad Request"),
    message: z.string(),
    statusCode: z.literal(HttpStatus.BAD_REQUEST),
  }),
) {}
