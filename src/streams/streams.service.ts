import {
  BadRequestException,
  Injectable,
  NotFoundException,
  NotImplementedException,
} from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { isEmpty, isObject, isString } from "radash";

import { HandlersGateway } from "../handlers/handlers.gateway";
import { Stream } from "./classes/stream.class";

/**
 * Service for managing data streams.
 *
 * Provides functionality for:
 *
 * - Creating new streams
 * - Reading stream data
 * - Updating stream data
 * - Deleting streams
 * - Real-time communication with handlers
 *
 * @class StreamsService
 */
@Injectable()
export class StreamsService {
  public constructor(private readonly handlersGateway: HandlersGateway) {}

  /**
   * Creates a new stream for a handler.
   *
   * @param {string} handlerId - The ID of the handler to create the stream for
   * @param {string} userId - The ID of the user creating the stream
   * @param {Pick<Stream, "configuration" | "name">} streamParameters - The
   *   parameters for the new stream
   * @returns The created stream data
   * @throws {NotFoundException} If handler is not found
   * @throws {BadRequestException} If handler returns an error or data is
   *   invalid
   * @throws {NotImplementedException} If handler returns invalid response
   *   format
   */
  public async createStream(
    handlerId: string,
    userId: string,
    streamParameters: Pick<Stream, "configuration" | "name">,
  ): Promise<Stream> {
    const response = await this._emitToHandler(
      handlerId,
      "create",
      userId,
      streamParameters,
    );

    const stream = plainToInstance(Stream, response);

    const errors = validateSync(stream);

    if (!isEmpty(errors)) {
      throw new BadRequestException(errors);
    }

    return stream;
  }

  /**
   * Deletes a stream.
   *
   * @param {string} handlerId - The ID of the handler that owns the stream
   * @param {string} userId - The ID of the user deleting the stream
   * @param {string} streamId - The ID of the stream to delete
   * @throws {NotFoundException} If handler is not found
   * @throws {BadRequestException} If handler returns an error
   * @throws {NotImplementedException} If handler returns invalid response
   *   format
   */
  public async deleteStream(
    handlerId: string,
    userId: string,
    streamId: string,
  ): Promise<void> {
    return this._emitToHandler(handlerId, "delete", userId, streamId);
  }

  /**
   * Reads data from a stream.
   *
   * @param {string} handlerId - The ID of the handler that owns the stream
   * @param {string} userId - The ID of the user reading the stream
   * @param {string} streamId - The ID of the stream to read
   * @returns The stream data
   * @throws {NotFoundException} If handler is not found
   * @throws {BadRequestException} If handler returns an error
   * @throws {NotImplementedException} If handler returns invalid response
   *   format
   */
  public async readStream(
    handlerId: string,
    userId: string,
    streamId: string,
  ): Promise<Stream> {
    const response = await this._emitToHandler(
      handlerId,
      "read",
      userId,
      streamId,
    );

    const stream = plainToInstance(Stream, response);

    const errors = validateSync(stream);

    if (!isEmpty(errors)) {
      throw new BadRequestException(errors);
    }

    return stream;
  }

  /**
   * Updates data in a stream.
   *
   * @param {string} handlerId - The ID of the handler that owns the stream
   * @param {string} userId - The ID of the user updating the stream
   * @param {string} streamId - The ID of the stream to update
   * @param {unknown} changes - The changes to apply to the stream
   * @returns The updated stream data
   * @throws {NotFoundException} If handler is not found
   * @throws {BadRequestException} If handler returns an error or changes are
   *   invalid
   * @throws {NotImplementedException} If handler returns invalid response
   *   format
   */
  public async updateStream(
    handlerId: string,
    userId: string,
    streamId: string,
    changes: unknown,
  ): Promise<Stream> {
    const stream = plainToInstance(Stream, changes);

    const errors = validateSync(stream, { skipMissingProperties: true });

    if (!isEmpty(errors)) {
      throw new BadRequestException(errors);
    }

    const response = await this._emitToHandler(
      handlerId,
      "update",
      userId,
      streamId,
      stream,
    );

    const updatedStream = plainToInstance(Stream, response);

    const updatedStreamErrors = validateSync(updatedStream);

    if (!isEmpty(updatedStreamErrors)) {
      throw new BadRequestException(updatedStreamErrors);
    }

    return updatedStream;
  }

  /**
   * Emits an event to a handler and waits for the response.
   *
   * @private
   * @param {string} handlerId - The ID of the handler to emit to
   * @param {string} event - The event name to emit
   * @param {...unknown} data - Additional data to send with the event
   * @returns The handler's response
   * @throws {NotFoundException} If handler is not found
   * @throws {BadRequestException} If handler returns an error
   * @throws {NotImplementedException} If handler returns invalid response
   *   format
   */
  private async _emitToHandler<T>(
    handlerId: string,
    event: string,
    ...data: unknown[]
  ): Promise<T> {
    const { server } = this.handlersGateway;

    const sockets = await server.fetchSockets();

    const socket = sockets.find(
      ({ data: socketData }) => socketData.id === handlerId,
    );

    if (!socket) {
      throw new NotFoundException("Handler not found");
    }

    return new Promise((resolve, reject) => {
      socket.emit(`stream:${event}`, ...data, (response: unknown) => {
        if (
          !isObject(response) ||
          !("success" in response) ||
          typeof response.success !== "boolean" ||
          ("error" in response && !isString(response.error))
        ) {
          reject(new NotImplementedException("Invalid response format"));

          return;
        }

        if ("error" in response) {
          reject(new BadRequestException(response.error));

          return;
        }

        resolve(response as T);
      });
    });
  }
}
