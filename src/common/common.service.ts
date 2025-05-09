import { Injectable } from "@nestjs/common";
import { Request } from "express";
import { isString } from "radash";
import { DataSource } from "typeorm";

/**
 * Service providing common functionality used across the application.
 *
 * Provides:
 *
 * - User authentication utilities
 * - Session management
 * - Database access for common operations
 *
 * @class CommonService
 */
@Injectable()
export class CommonService {
  public constructor(private readonly dataSource: DataSource) {}

  /**
   * Retrieves the user ID from a request using the session ID.
   *
   * Extracts the X-Session-Id header from the request and queries the database
   * to find the associated user ID. Returns null if:
   *
   * - No session ID is provided
   * - Session ID is invalid
   * - Session is not found in the database
   *
   * @param {Request} request - The HTTP request object
   * @returns {Promise<null | string>} The user ID if authenticated, null
   *   otherwise
   */
  public async getUserIdFromRequest(request: Request): Promise<null | string> {
    const sessionId = request.headers["x-session-id"];

    if (!isString(sessionId)) {
      return null;
    }

    const result = await this.dataSource.query<{ user_id: string }[]>(
      "SELECT user_id FROM user_sessions WHERE id = $1",
      [sessionId],
    );

    return result[0]?.user_id ?? null;
  }
}
