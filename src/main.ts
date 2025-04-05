import type { NestExpressApplication } from "@nestjs/platform-express";

import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { AppModule } from "./app.module";
import { WsAdapter } from "./websocket/websocket.adapter";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });

  SwaggerModule.setup("api", app, () =>
    SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle("Cats example")
        .setDescription("The cats API description")
        .setVersion("1.0")
        .addTag("cats")
        .build(),
    ),
  );

  app.useGlobalPipes(new ValidationPipe());

  app.useWebSocketAdapter(new WsAdapter(app));

  await app.listen(process.env.PORT);
}

bootstrap().catch(() => {});
