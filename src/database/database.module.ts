import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

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
