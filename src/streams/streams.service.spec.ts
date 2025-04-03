import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { StreamsService } from "./streams.service";
import { Stream } from "./entities/stream.entity";
import { CreateStreamDto } from "./dto/create-stream.dto";

describe("StreamsService", () => {
  let service: StreamsService;
  let streamRepository: Repository<Stream>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StreamsService,
        {
          provide: getRepositoryToken(Stream),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<StreamsService>(StreamsService);
    streamRepository = module.get<Repository<Stream>>(
      getRepositoryToken(Stream)
    );
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a stream", async () => {
      const createDto: CreateStreamDto = {
        name: "Test Stream",
        configuration: { key: "value" },
        handlerId: "handler-123",
      };

      const saveSpy = jest
        .spyOn(streamRepository, "save")
        .mockResolvedValueOnce({
          id: "stream-123",
          ...createDto,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        } as Stream);

      const result = await service.create(createDto);

      expect(saveSpy).toHaveBeenCalled();
      expect(result.id).toBeDefined();
      expect(result.name).toBe(createDto.name);
    });
  });

  describe("findOne", () => {
    it("should find a stream by id", async () => {
      const mockStream = {
        id: "stream-123",
        name: "Test Stream",
        configuration: { key: "value" },
        handlerId: "handler-123",
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      jest
        .spyOn(streamRepository, "findOne")
        .mockResolvedValueOnce(mockStream as Stream);

      const result = await service.findOne("stream-123");

      expect(result).toEqual(mockStream);
    });

    it("should return undefined for non-existent stream", async () => {
      jest.spyOn(streamRepository, "findOne").mockResolvedValueOnce(undefined);

      const result = await service.findOne("non-existent");

      expect(result).toBeUndefined();
    });
  });

  // Add similar tests for update, remove, findByHandlerId
});
