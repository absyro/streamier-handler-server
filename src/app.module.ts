import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { HandlersModule } from "./handlers/handlers.module";
import { appConfig } from "./config/configuration";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      host: appConfig.database.host,
      port: appConfig.database.port,
      username: appConfig.database.username,
      password: appConfig.database.password,
      database: appConfig.database.database,
      entities: [__dirname + "/**/*.entity{.ts,.js}"],
      synchronize: true,
      ssl: appConfig.database.sslMode === "require",
    }),
    HandlersModule,
  ],
})
export class AppModule {}
