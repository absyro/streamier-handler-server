import { Global, Module } from "@nestjs/common";

import { HandlersGateway } from "../handlers/handlers.gateway";
import { HandlersModule } from "../handlers/handlers.module";
import { CommonService } from "./common.service";

@Global()
@Module({
  exports: [CommonService],
  imports: [HandlersModule],
  providers: [CommonService, HandlersGateway],
})
export class CommonModule {}
