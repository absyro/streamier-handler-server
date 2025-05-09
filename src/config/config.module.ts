import { Module } from "@nestjs/common";
import { ConfigModule as NestConfigModule } from "@nestjs/config";
import Joi from "joi";

import { Environment } from "../types/environment";

/**
 * Configuration module that manages application settings.
 *
 * Provides:
 *
 * - Environment variable validation
 * - Configuration management
 * - Default values for optional settings
 *
 * Validates the following environment variables:
 *
 * - DB_HOST: Database hostname (default: localhost)
 * - DB_NAME: Database name (required)
 * - DB_PASSWORD: Database password (required)
 * - DB_PORT: Database port (default: 5432)
 * - DB_SSL_MODE: SSL mode (default: disable)
 *
 *   - Allow: Allow SSL connections
 *   - Disable: Disable SSL
 *   - Prefer: Prefer SSL connections
 *   - Require: Require SSL connections
 *   - Verify-ca: Verify SSL certificate authority
 *   - Verify-full: Verify full SSL certificate
 * - DB_USER: Database username (default: postgres)
 * - NODE_ENV: Environment (default: development)
 *
 *   - Development: Development environment
 *   - Production: Production environment
 * - PORT: Application port (default: 3000)
 *
 * @class ConfigModule
 */
@Module({
  exports: [NestConfigModule],
  imports: [
    NestConfigModule.forRoot({
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
  ],
})
export class ConfigModule {}
