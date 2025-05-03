import type { NestExpressApplication } from "@nestjs/platform-express";

import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import compression from "compression";

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
        .setTitle("Streamier Handler Server Docs")
        .setDescription(
          "This documentation includes all available API endpoints for the Streamier Handler Server.",
        )
        .setVersion("1.0.0")
        .setTermsOfService("https://www.streamier.net/terms-of-service")
        .setExternalDoc("official documentation", "https://docs.streamier.net")
        .setContact(
          "Streamier Support",
          "https://www.streamier.net/contact-us",
          "contact@streamier.net",
        )
        .build(),
    ),
  );

  app.use(compression());

  app.useGlobalPipes(new ValidationPipe());

  app.useWebSocketAdapter(new WsAdapter(app));

  await app.listen(process.env.PORT);
}

void bootstrap();
