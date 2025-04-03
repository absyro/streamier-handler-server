import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { appConfig } from "./config/configuration";
import { LoggingMiddleware } from "./common/middleware/logging.middleware";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { WsAdapter } from "./websocket/websocket.adapter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new HttpExceptionFilter());
  app.use(LoggingMiddleware);
  app.useWebSocketAdapter(new WsAdapter(app));

  await app.listen(appConfig.port);
  console.log(`Server running on port ${appConfig.port}`);
}
bootstrap();
