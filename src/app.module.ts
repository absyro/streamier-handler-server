import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import Joi from "joi";

import { HandlersModule } from "./handlers/handlers.module";
import { Environment } from "./types/environment";

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object<Environment, true>({
        DB_HOST: Joi.string().hostname().default("localhost"),
        DB_NAME: Joi.string(),
        DB_PASSWORD: Joi.string(),
        DB_PORT: Joi.number().port().default(5432),
        DB_SSL_MODE: Joi.string()
          .valid(
            "allow",
            "disable",
            "prefer",
            "require",
            "verify-ca",
            "verify-full",
          )
          .default("disable"),
        DB_USER: Joi.string().default("postgres"),
        NODE_ENV: Joi.string()
          .valid("development", "production")
          .default("development"),
        PORT: Joi.number().port().default(3000),
      }),
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        autoLoadEntities: true,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
        ssl: process.env.DB_SSL_MODE === "require",
        synchronize: process.env.NODE_ENV !== "production",
        type: "postgres",
        username: process.env.DB_USER,
      }),
    }),
    HandlersModule,
  ],
})
export class AppModule {}
