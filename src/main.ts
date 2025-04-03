import type { NestExpressApplication } from "@nestjs/platform-express";

import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { WsAdapter } from "./websocket/websocket.adapter";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });

  app.useGlobalFilters(new HttpExceptionFilter());

  app.useWebSocketAdapter(new WsAdapter(app));

  await app.listen(process.env.PORT);
}

bootstrap().catch(() => {});
