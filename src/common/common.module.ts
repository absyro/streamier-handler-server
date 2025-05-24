import { Global, Module } from "@nestjs/common";

import { HandlersModule } from "@/handlers/handlers.module";

import { CommonService } from "./common.service";

@Global()
@Module({
  exports: [CommonService],
  imports: [HandlersModule],
  providers: [CommonService],
})
export class CommonModule {}
