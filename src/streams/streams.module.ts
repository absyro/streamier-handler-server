import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { HandlersModule } from "../handlers/handlers.module";
import { Stream } from "./entities/stream.entity";
import { StreamsService } from "./streams.service";

@Module({
  exports: [StreamsService],
  imports: [TypeOrmModule.forFeature([Stream]), HandlersModule],
  providers: [StreamsService],
})
export class StreamsModule {}
