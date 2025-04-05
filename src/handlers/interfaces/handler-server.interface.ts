import type { DefaultEventsMap, Server } from "socket.io";

export type HandlerServer = Server<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  { id: string }
>;
