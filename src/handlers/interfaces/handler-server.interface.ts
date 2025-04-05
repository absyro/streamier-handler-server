import type { DefaultEventsMap, Server } from "socket.io";

import type { HandlerSocketData } from "./handler-socket-data.interface";

export type HandlerServer = Server<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  HandlerSocketData
>;
