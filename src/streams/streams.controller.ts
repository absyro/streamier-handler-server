import { Controller, Post } from "@nestjs/common";

@Controller("api/streams")
export class StreamsController {
  @Post()
  public createStream() {}
}
