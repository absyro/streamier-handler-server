import type { DefaultEventsMap, Socket } from "socket.io";

export type HandlerSocket = Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  { id: string }
>;
