import type { DefaultEventsMap, Namespace } from "socket.io";

import type { HandlerSocketData } from "./handler-socket-data.interface";

export type HandlerNamespace = Namespace<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  HandlerSocketData
>;
