import { Module } from "@nestjs/common";
import { ConfigModule as NestConfigModule } from "@nestjs/config";
import Joi from "joi";

import { Environment } from "../types/environment";

@Module({
  exports: [NestConfigModule],
  imports: [
    NestConfigModule.forRoot({
      validationSchema: Joi.object<Environment, true>({
        DB_HOST: Joi.string().hostname().default("localhost"),
        DB_NAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
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
  ],
})
export class ConfigModule {}
