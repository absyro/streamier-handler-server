import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "./app.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Stream } from "./streams/entities/stream.entity";
import { Handler } from "./handlers/entities/handler.entity";
import { TestUtils } from "../test/test-utils";

describe("AppController (e2e)", () => {
  let app: INestApplication;
  let streamRepository: any;
  let handlerRepository: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: "postgres",
          host: "localhost",
          port: 5432,
          username: "test",
          password: "test",
          database: "test",
          entities: [Stream, Handler],
          synchronize: true,
          dropSchema: true,
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    streamRepository = moduleFixture.get("StreamRepository");
    handlerRepository = moduleFixture.get("HandlerRepository");
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await TestUtils.resetDB([streamRepository, handlerRepository]);
  });

  describe("/api/streams (POST)", () => {
    it("should create a stream", async () => {
      const createDto = {
        name: "Test Stream",
        configuration: { key: "value" },
        handlerId: "handler-123",
      };

      await request(app.getHttpServer())
        .post("/api/streams")
        .set("x-session-id", "session-123")
        .send(createDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.name).toBe(createDto.name);
          expect(res.body.handlerId).toBe(createDto.handlerId);
        });
    });
  });

  // Add more integration tests
});
