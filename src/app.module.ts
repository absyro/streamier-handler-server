import { Module } from "@nestjs/common";
import { ThrottlerModule } from "@nestjs/throttler";

import { CommonModule } from "./common/common.module";
import { ConfigModule } from "./config/config.module";
import { DatabaseModule } from "./database/database.module";
import { HandlersModule } from "./handlers/handlers.module";
import { StreamsModule } from "./streams/streams.module";

/**
 * Root module that bootstraps the application and configures global settings.
 *
 * The root module that:
 *
 * - Configures rate limiting (20 requests per minute)
 * - Imports all feature modules
 * - Sets up global providers and middleware
 *
 * @module AppModule
 * @property {Module} imports - Array of imported modules:
 *
 *   - ConfigModule: Application configuration
 *   - DatabaseModule: Database connection and repositories
 *   - ThrottlerModule: Rate limiting configuration
 *   - HandlersModule: Handler-related features
 *   - StreamsModule: Stream-related features
 *   - CommonModule: Shared utilities and services
 */
@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          limit: 20,
          ttl: 60000,
        },
      ],
    }),
    HandlersModule,
    StreamsModule,
    CommonModule,
  ],
})
export class AppModule {}
