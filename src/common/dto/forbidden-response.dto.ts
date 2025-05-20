import { HttpStatus } from "@nestjs/common";
import { ReasonPhrases } from "http-status-codes";
import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export class ForbiddenResponseDto extends createZodDto(
  z.object({
    error: z.literal(ReasonPhrases.FORBIDDEN),
    message: z.string(),
    statusCode: z.literal(HttpStatus.FORBIDDEN),
  }),
) {}
