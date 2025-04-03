import { Test, TestingModule } from "@nestjs/testing";
import { HandlersGateway } from "./handlers.gateway";
import { StreamsService } from "../streams/streams.service";
import { HandlersService } from "./handlers.service";
import { Server, Socket } from "socket.io";

describe("HandlersGateway", () => {
  let gateway: HandlersGateway;
  let streamsService: StreamsService;
  let handlersService: HandlersService;

  const mockSocket = {
    id: "socket-123",
    handshake: {
      query: {
        access_token: "valid-token",
      },
    },
    disconnect: jest.fn(),
    on: jest.fn(),
    emit: jest.fn(),
  } as unknown as Socket;

  const mockHandler = {
    id: "handler-123",
    accessToken: "valid-token",
    ownerId: "user-123",
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HandlersGateway,
        {
          provide: StreamsService,
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: HandlersService,
          useValue: {
            findByAccessToken: jest.fn().mockResolvedValue(mockHandler),
          },
        },
      ],
    }).compile();

    gateway = module.get<HandlersGateway>(HandlersGateway);
    streamsService = module.get<StreamsService>(StreamsService);
    handlersService = module.get<HandlersService>(HandlersService);

    gateway["server"] = {
      sockets: {
        sockets: new Map([[mockSocket.id, mockSocket]]),
      },
    } as unknown as Server;
  });

  it("should be defined", () => {
    expect(gateway).toBeDefined();
  });

  describe("handleConnection", () => {
    it("should accept connection with valid token", async () => {
      await gateway.handleConnection(mockSocket);
      expect(handlersService.findByAccessToken).toHaveBeenCalledWith(
        "valid-token"
      );
    });

    it("should reject connection with invalid token", async () => {
      const invalidSocket = {
        ...mockSocket,
        handshake: { query: { access_token: "invalid" } },
      } as unknown as Socket;

      handlersService.findByAccessToken = jest.fn().mockResolvedValue(null);

      await gateway.handleConnection(invalidSocket);
      expect(invalidSocket.disconnect).toHaveBeenCalled();
    });
  });

  describe("stream operations", () => {
    beforeEach(async () => {
      await gateway.handleConnection(mockSocket);
    });

    it("should handle stream creation", async () => {
      const createData = {
        name: "Test Stream",
        configuration: { key: "value" },
        handlerId: "handler-123",
      };

      const mockStream = {
        id: "stream-123",
        ...createData,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      jest.spyOn(streamsService, "create").mockResolvedValue(mockStream as any);

      const result = await gateway.handleStreamCreate(mockSocket, createData);

      expect(result.success).toBe(true);
      expect(result.stream).toEqual(mockStream);
    });

    // Add similar tests for other stream operations
  });
});
