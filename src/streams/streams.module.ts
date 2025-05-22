import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { CommonModule } from "@/common/common.module";
import { HandlersModule } from "@/handlers/handlers.module";

import { Stream } from "./entities/stream.entity";
import { StreamsController } from "./streams.controller";
import { StreamsService } from "./streams.service";

@Module({
  controllers: [StreamsController],
  exports: [StreamsService],
  imports: [CommonModule, HandlersModule, TypeOrmModule.forFeature([Stream])],
  providers: [StreamsService],
})
export class StreamsModule {}
