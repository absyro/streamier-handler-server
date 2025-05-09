import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

/**
 * Database module that configures and manages database connections.
 *
 * Provides:
 *
 * - TypeORM configuration
 * - Database connection management
 * - Entity auto-loading
 * - Environment-based configuration
 *
 * Configuration is based on environment variables:
 *
 * - DB_NAME: Database name
 * - DB_HOST: Database host
 * - DB_PASSWORD: Database password
 * - DB_PORT: Database port
 * - DB_SSL_MODE: SSL mode (require/enable/disable)
 * - DB_USER: Database username
 * - NODE_ENV: Environment (production/development)
 *
 * @class DatabaseModule
 */
@Module({
  exports: [TypeOrmModule],
  imports: [
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
  ],
})
export class DatabaseModule {}
