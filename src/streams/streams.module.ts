import { Module } from "@nestjs/common";

import { HandlersGateway } from "../handlers/handlers.gateway";
import { HandlersModule } from "../handlers/handlers.module";
import { StreamsController } from "./streams.controller";
import { StreamsService } from "./streams.service";

/**
 * Module for managing data streams.
 *
 * Provides functionality for:
 *
 * - Processing and managing data streams
 * - Real-time stream updates via WebSocket
 * - Stream data persistence and retrieval
 *
 * @module StreamsModule
 * @property {Array} controllers - REST API controllers for stream management
 * @property {Array} exports - Services exposed to other modules
 * @property {Array} imports - Required modules and dependencies
 * @property {Array} providers - Injectable services and gateways
 */
@Module({
  controllers: [StreamsController],
  exports: [StreamsService],
  imports: [HandlersModule],
  providers: [StreamsService, HandlersModule, HandlersGateway],
})
export class StreamsModule {}
