import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export class WebhookPayloadDto extends createZodDto(
  z.record(z.unknown()).describe("The webhook payload data"),
) {}
