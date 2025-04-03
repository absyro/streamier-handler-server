import { Test } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { INestApplication } from "@nestjs/common";
import { Repository } from "typeorm";
import { io, Socket } from "socket.io-client";

export class TestUtils {
  static async getTestModule(entities: any[]) {
    return Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: "postgres",
          host: "localhost",
          port: 5432,
          username: "test",
          password: "test",
          database: "test",
          entities: [...entities],
          synchronize: true,
          dropSchema: true,
        }),
        TypeOrmModule.forFeature([...entities]),
      ],
    }).compile();
  }

  static async closeApp(app: INestApplication) {
    await app.close();
  }

  static async resetDB(repositories: Repository<any>[]) {
    for (const repo of repositories) {
      await repo.clear();
    }
  }

  static async createSocketClient(
    port: number,
    accessToken?: string,
  ): Promise<Socket> {
    return new Promise((resolve) => {
      const client = io(`http://localhost:${port}/handlers`, {
        query: { access_token: accessToken || "test-token" },
        transports: ["websocket"],
        forceNew: true,
      });

      client.on("connect", () => {
        resolve(client);
      });
    });
  }

  static async closeSocketClient(client: Socket): Promise<void> {
    return new Promise((resolve) => {
      if (client.connected) {
        client.disconnect();
      }
      resolve();
    });
  }
}
