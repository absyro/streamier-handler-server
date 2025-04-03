import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { HandlersController } from "./handlers.controller";
import { HandlersService } from "./handlers.service";
import { Handler } from "./entities/handler.entity";
import { HandlersGateway } from "./handlers.gateway";

@Module({
  imports: [TypeOrmModule.forFeature([Handler])],
  controllers: [HandlersController],
  providers: [HandlersService, HandlersGateway],
  exports: [HandlersService], // Export if needed by other modules
})
export class HandlersModule {}
