import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { HandlersModule } from "@/handlers/handlers.module";

import { Stream } from "./entities/stream.entity";
import { StreamsController } from "./streams.controller";
import { StreamsService } from "./streams.service";

@Module({
  controllers: [StreamsController],
  exports: [StreamsService],
  imports: [HandlersModule, TypeOrmModule.forFeature([Stream])],
  providers: [StreamsService],
})
export class StreamsModule {}
