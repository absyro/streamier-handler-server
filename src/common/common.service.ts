import { Injectable } from "@nestjs/common";
import { Request } from "express";
import { DataSource } from "typeorm";

@Injectable()
export class CommonService {
  public constructor(private readonly dataSource: DataSource) {}

  public async getUserIdFromRequest(request: Request): Promise<null | string> {
    const sessionId = request.headers["x-session-id"];

    if (typeof sessionId !== "string") {
      return null;
    }

    const result = await this.dataSource.query<{ user_id: string }[]>(
      "SELECT user_id FROM sessions WHERE id = $1",
      [sessionId],
    );

    return result[0]?.user_id ?? null;
  }
}
