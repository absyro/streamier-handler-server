import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { appConfig } from "./config/configuration";
import { HandlersModule } from "./handlers/handlers.module";
import { StreamsModule } from "./streams/streams.module";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      database: appConfig.database.database,
      entities: [`${__dirname}/**/*.entity{.ts,.js}`],
      host: appConfig.database.host,
      password: appConfig.database.password,
      port: appConfig.database.port,
      ssl: appConfig.database.sslMode === "require",
      synchronize: true,
      type: "postgres",
      username: appConfig.database.username,
    }),
    HandlersModule,
    StreamsModule,
  ],
})
export class AppModule {}
