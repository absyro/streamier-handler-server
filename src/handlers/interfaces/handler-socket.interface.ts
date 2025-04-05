import type { DefaultEventsMap, Socket } from "socket.io";

import type { HandlerSocketData } from "./handler-socket-data.interface";

export type HandlerSocket = Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  HandlerSocketData
>;
