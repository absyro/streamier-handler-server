import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";

@Injectable()
export class CommonService {
  public constructor(private readonly dataSource: DataSource) {}

  public async doesUserExist(userId: string): Promise<boolean> {
    const result = await this.dataSource.query<{ exists: boolean }[]>(
      "SELECT EXISTS(SELECT 1 FROM users WHERE id = $1)",
      [userId],
    );

    return result[0]?.exists ?? false;
  }

  public async getUserIdFromSessionId(
    sessionId: string,
  ): Promise<null | string> {
    const result = await this.dataSource.query<{ user_id: string }[]>(
      "SELECT user_id FROM user_sessions WHERE id = $1",
      [sessionId],
    );

    return result[0]?.user_id ?? null;
  }
}
