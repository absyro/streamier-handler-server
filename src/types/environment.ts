export interface Environment {
  DB_HOST: string;
  DB_NAME: string;
  DB_PASSWORD: string;
  DB_PORT: number;
  DB_SSL_MODE:
    | "allow"
    | "disable"
    | "prefer"
    | "require"
    | "verify-ca"
    | "verify-full";
  DB_USER: string;
  NODE_ENV: "development" | "production";
  PORT: number;
}

declare global {
  namespace NodeJS {
    // eslint-disable-next-line unicorn/prevent-abbreviations
    interface ProcessEnv extends Environment {}
  }
}
