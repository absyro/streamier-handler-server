import { Module } from "@nestjs/common";
import { ThrottlerModule } from "@nestjs/throttler";

import { CommonModule } from "./common/common.module";
import { ComponentsModule } from "./components/components.module";
import { ConfigModule } from "./config/config.module";
import { DatabaseModule } from "./database/database.module";
import { HandlersModule } from "./handlers/handlers.module";
import { StreamsModule } from "./streams/streams.module";

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
    ComponentsModule,
    CommonModule,
  ],
})
export class AppModule {}
