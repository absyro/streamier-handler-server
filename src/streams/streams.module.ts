import { Module } from "@nestjs/common";

import { HandlersModule } from "../handlers/handlers.module";
import { StreamsController } from "./streams.controller";
import { StreamsService } from "./streams.service";

@Module({
  controllers: [StreamsController],
  exports: [StreamsService],
  imports: [HandlersModule],
  providers: [StreamsService],
})
export class StreamsModule {}
