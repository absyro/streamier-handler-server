import { Module } from "@nestjs/common";

import { HandlersModule } from "../handlers/handlers.module";
import { ComponentsController } from "./components.controller";
import { ComponentsService } from "./components.service";

@Module({
  controllers: [ComponentsController],
  exports: [ComponentsService],
  imports: [HandlersModule],
  providers: [ComponentsService],
})
export class ComponentsModule {}
