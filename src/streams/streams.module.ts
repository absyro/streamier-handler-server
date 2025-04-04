import { Module } from "@nestjs/common";

import { StreamsController } from "./streams.controller";
import { StreamsService } from "./streams.service";

@Module({
  controllers: [StreamsController],
  exports: [StreamsService],
  providers: [StreamsService],
})
export class StreamsModule {}
