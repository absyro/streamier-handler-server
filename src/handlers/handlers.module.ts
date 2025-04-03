import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Handler } from "./entities/handler.entity";
import { HandlersController } from "./handlers.controller";
import { HandlersGateway } from "./handlers.gateway";
import { HandlersService } from "./handlers.service";

@Module({
  controllers: [HandlersController],
  exports: [HandlersService],
  imports: [TypeOrmModule.forFeature([Handler])],
  providers: [HandlersService, HandlersGateway],
})
export class HandlersModule {}
