import { HttpStatus } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export class ServiceUnavailableResponseDto extends createZodDto(
  z.object({
    error: z.literal("Service Unavailable"),
    message: z.string(),
    statusCode: z.literal(HttpStatus.SERVICE_UNAVAILABLE),
  }),
) {}
