/**
 * Interface for handler socket data.
 *
 * Defines the data structure that is attached to each WebSocket connection for
 * a handler. This data is used to associate the socket with a specific
 * handler.
 *
 * @property {string} id - The unique identifier of the handler associated with
 *   this socket
 * @interface HandlerSocketData
 */
export interface HandlerSocketData {
  id: string;
}
