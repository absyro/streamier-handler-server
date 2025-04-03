import { Test, TestingModule } from "@nestjs/testing";
import { StreamsController } from "./streams.controller";
import { StreamsService } from "./streams.service";
import { CreateStreamDto } from "./dto/create-stream.dto";
import { Stream } from "./entities/stream.entity";

describe("StreamsController", () => {
  let controller: StreamsController;
  let service: StreamsService;

  const mockStream: Stream = {
    id: "stream-123",
    name: "Test Stream",
    configuration: { key: "value" },
    handlerId: "handler-123",
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StreamsController],
      providers: [
        {
          provide: StreamsService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockStream),
            findOne: jest.fn().mockResolvedValue(mockStream),
            update: jest.fn().mockResolvedValue(mockStream),
            remove: jest.fn().mockResolvedValue(undefined),
            findByHandlerId: jest.fn().mockResolvedValue([mockStream]),
          },
        },
      ],
    }).compile();

    controller = module.get<StreamsController>(StreamsController);
    service = module.get<StreamsService>(StreamsService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("create", () => {
    it("should create a stream", async () => {
      const createDto: CreateStreamDto = {
        name: "Test Stream",
        configuration: { key: "value" },
        handlerId: "handler-123",
      };

      const result = await controller.create("session-123", createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockStream);
    });
  });

  // Add similar tests for other controller methods
});
