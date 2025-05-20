import { HttpStatus } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export class BadGatewayResponseDto extends createZodDto(
  z.object({
    error: z.literal("Bad Gateway"),
    message: z.string(),
    statusCode: z.literal(HttpStatus.BAD_GATEWAY),
  }),
) {}
