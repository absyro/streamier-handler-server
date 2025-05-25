import { Module, OnModuleInit } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Stream } from "@/streams/entities/stream.entity";

import { Handler } from "./entities/handler.entity";
import { HandlersController } from "./handlers.controller";
import { HandlersGateway } from "./handlers.gateway";
import { HandlersService } from "./handlers.service";

@Module({
  controllers: [HandlersController],
  exports: [HandlersService],
  imports: [
    TypeOrmModule.forFeature([Handler]),
    TypeOrmModule.forFeature([Stream]),
  ],
  providers: [HandlersService, HandlersGateway],
})
export class HandlersModule implements OnModuleInit {
  public constructor(private readonly handlersService: HandlersService) {}

  public async onModuleInit(): Promise<void> {
    await this.handlersService.deactivateAllHandlers();
  }
}
