import { HttpStatus } from "@nestjs/common";
import { ReasonPhrases } from "http-status-codes";
import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export class BadGatewayResponseDto extends createZodDto(
  z.object({
    error: z.literal(ReasonPhrases.BAD_GATEWAY),
    message: z.string(),
    statusCode: z.literal(HttpStatus.BAD_GATEWAY),
  }),
) {}
