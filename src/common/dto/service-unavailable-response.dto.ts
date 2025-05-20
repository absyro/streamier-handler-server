import { HttpStatus } from "@nestjs/common";
import { ReasonPhrases } from "http-status-codes";
import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export class ServiceUnavailableResponseDto extends createZodDto(
  z.object({
    error: z.literal(ReasonPhrases.SERVICE_UNAVAILABLE),
    message: z.string(),
    statusCode: z.literal(HttpStatus.SERVICE_UNAVAILABLE),
  }),
) {}
