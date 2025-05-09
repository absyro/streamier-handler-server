import { Global, Module } from "@nestjs/common";

import { CommonService } from "./common.service";

/**
 * Global module providing common functionality across the application.
 *
 * Provides:
 *
 * - Global access to common services
 * - Shared utilities and functionality
 * - Cross-module service injection
 *
 * This module is marked as @Global() to make its providers available throughout
 * the application without explicit imports.
 *
 * @class CommonModule
 */
@Global()
@Module({
  exports: [CommonService],
  providers: [CommonService],
})
export class CommonModule {}
