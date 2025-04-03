export const appConfig: {
  database: {
    database: string;
    host: string;
    password: string;
    port: number;
    sslMode: string;
    username: string;
  };
  maxHandlersPerUser: number;
  port: number;
} = {
  database: {
    database: "database",
    host: "localhost",
    password: "1234",
    port: 5432,
    sslMode: "disable",
    username: "postgres",
  },
  maxHandlersPerUser: 10,
  port: 8080,
};
