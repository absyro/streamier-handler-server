import type { DefaultEventsMap, Namespace } from "socket.io";

export type HandlerNamespace = Namespace<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  { id: string }
>;
