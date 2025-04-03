import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { StreamsService } from "./streams.service";
import { Stream } from "./entities/stream.entity";
import { HandlersModule } from "../handlers/handlers.module";

@Module({
  imports: [TypeOrmModule.forFeature([Stream]), HandlersModule],
  providers: [StreamsService],
  exports: [StreamsService],
})
export class StreamsModule {}
