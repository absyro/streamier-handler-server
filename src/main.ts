import type { NestExpressApplication } from "@nestjs/platform-express";
import type { RedocOptions } from "nestjs-redoc";

import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import compression from "compression";
import partialResponse from "express-partial-response";
import { RedocModule } from "nestjs-redoc";
import { dedent } from "ts-dedent";

import packageJson from "../package.json";
import { AppModule } from "./app.module";
import { WsAdapter } from "./websocket/websocket.adapter";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });

  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle("Streamier API Server")
      .setDescription(
        dedent`
        This documentation includes all available API endpoints for the Streamier API Server.

        ## Rate Limiting
        The API is rate-limited to 20 requests per minute to prevent abuse.

        ## Error Handling
        All errors are returned in a consistent format with appropriate HTTP status codes.`,
      )
      .setVersion(packageJson.version)
      .setTermsOfService("https://www.streamier.net/terms-of-service")
      .setExternalDoc("official documentation", "https://docs.streamier.net")
      .setContact(
        "Streamier Support",
        "https://www.streamier.net/contact-us",
        "contact@streamier.net",
      )
      .build(),
  );

  const redocOptions: RedocOptions = {};

  await RedocModule.setup("/docs", app, document, redocOptions);

  app.use(partialResponse());

  app.use(compression());

  app.useGlobalPipes(new ValidationPipe());

  app.useWebSocketAdapter(new WsAdapter(app));

  await app.listen(process.env.PORT);
}

void bootstrap();
