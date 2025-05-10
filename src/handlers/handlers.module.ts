import { Module, OnModuleInit } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Handler } from "./entities/handler.entity";
import { HandlersController } from "./handlers.controller";
import { HandlersGateway } from "./handlers.gateway";
import { HandlersService } from "./handlers.service";

/**
 * Module that encapsulates all handler-related functionality.
 *
 * This module provides:
 *
 * - REST API endpoints for handler management
 * - WebSocket gateway for real-time handler updates
 * - Database integration for handler persistence
 * - Service layer for handler business logic
 *
 * @module HandlersModule
 * @property {Array} controllers - REST API controllers
 * @property {Array} exports - Services exposed to other modules
 * @property {Array} imports - Required modules and dependencies
 * @property {Array} providers - Injectable services and gateways
 */
@Module({
  controllers: [HandlersController],
  exports: [HandlersService],
  imports: [TypeOrmModule.forFeature([Handler])],
  providers: [HandlersService, HandlersGateway],
})
export class HandlersModule implements OnModuleInit {
  public constructor(private readonly handlersService: HandlersService) {}

  /**
   * Lifecycle hook that is called once the module has been initialized. Sets
   * all handlers to offline status when the server starts.
   */
  public async onModuleInit(): Promise<void> {
    await this.handlersService.setAllHandlersOffline();
  }
}
