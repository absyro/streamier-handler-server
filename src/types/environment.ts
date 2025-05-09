/**
 * Interface defining the structure of environment variables.
 *
 * Defines all required environment variables and their types. These variables
 * are used for database configuration and application settings.
 *
 * @property {string} DB_HOST - Database host address
 * @property {string} DB_NAME - Database name
 * @property {string} DB_PASSWORD - Database password
 * @property {number} DB_PORT - Database port number
 * @property {string} DB_SSL_MODE - Database SSL mode
 * @property {string} DB_USER - Database username
 * @property {string} NODE_ENV - Node environment (development/production)
 * @property {number} PORT - Application port number
 * @interface Environment
 */
export interface Environment {
  /** Database host address */
  DB_HOST: string;
  /** Database name */
  DB_NAME: string;
  /** Database password */
  DB_PASSWORD: string;
  /** Database port number */
  DB_PORT: number;
  /** Database SSL mode */
  DB_SSL_MODE:
    | "allow"
    | "disable"
    | "prefer"
    | "require"
    | "verify-ca"
    | "verify-full";
  /** Database username */
  DB_USER: string;
  /** Node environment (development/production) */
  NODE_ENV: "development" | "production";
  /** Application port number */
  PORT: number;
}

/**
 * Global type augmentation for NodeJS ProcessEnv. This extends the built-in
 * ProcessEnv interface with our custom environment variables.
 */
declare global {
  namespace NodeJS {
    interface ProcessEnv extends Environment {}
  }
}
