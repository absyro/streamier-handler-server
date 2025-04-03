import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { appConfig } from "./config/configuration";
import { WsAdapter } from "./websocket/websocket.adapter";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new HttpExceptionFilter());

  app.useWebSocketAdapter(new WsAdapter(app));

  await app.listen(appConfig.port);
}

bootstrap().catch(() => {});
