import * as config from "config";

export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  sslMode: string;
}

export interface AppConfig {
  port: number;
  database: DatabaseConfig;
  maxHandlersPerUser: number;
}

export const appConfig: AppConfig = {
  port: parseInt(process.env.PORT || "8080", 10),
  database: {
    host: process.env.DB_HOST || config.get<string>("database.host"),
    port: parseInt(process.env.DB_PORT) || config.get<string>("database.port"),
    username: process.env.DB_USER || config.get<string>("database.username"),
    password:
      process.env.DB_PASSWORD || config.get<string>("database.password"),
    database: process.env.DB_NAME || config.get<string>("database.database"),
    sslMode: process.env.DB_SSL_MODE || config.get<string>("database.sslMode"),
  },
  maxHandlersPerUser: parseInt(process.env.MAX_HANDLERS_PER_USER || "10", 10),
};
