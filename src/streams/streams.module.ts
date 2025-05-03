import { Module } from "@nestjs/common";

import { HandlersGateway } from "../handlers/handlers.gateway";
import { HandlersModule } from "../handlers/handlers.module";
import { StreamsController } from "./streams.controller";
import { StreamsService } from "./streams.service";

@Module({
  controllers: [StreamsController],
  exports: [StreamsService],
  imports: [HandlersModule],
  providers: [StreamsService, HandlersModule, HandlersGateway],
})
export class StreamsModule {}
