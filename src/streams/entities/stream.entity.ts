import {
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";

import { Handler } from "@/handlers/entities/handler.entity";

import { StreamSchema } from "../schemas/stream.schema";

@Entity({ name: "streams" })
export class Stream implements StreamSchema {
  @Column({ name: "configuration", type: "json" })
  public configuration!: Record<string, unknown>;

  @Column({ default: () => "CURRENT_TIMESTAMP", name: "created_at" })
  public createdAt!: string;

  @ManyToOne(() => Handler, { onDelete: "CASCADE" })
  public handler!: Handler;

  @Column({ length: 8, name: "handler_id" })
  public handlerId!: string;

  @PrimaryColumn({ length: 8, name: "id" })
  public id!: string;

  @Column({ default: false, name: "is_active" })
  public isActive!: boolean;

  @Column({ length: 5000, name: "long_description", nullable: true })
  public longDescription?: string;

  @Column({ length: 100, name: "name" })
  public name!: string;

  @Column({ name: "nodes", type: "json" })
  public nodes!: {
    data: Record<string, unknown>;
    id: string;
    name: string;
    outputs: Record<string, Stream["nodes"][number]["id"][]>;
  }[];

  @Column({ name: "permissions", type: "json" })
  public permissions!: {
    read: {
      all: (keyof StreamSchema)[];
      roles: Record<string, (keyof StreamSchema)[]>;
      teams: Record<string, (keyof StreamSchema)[]>;
      users: Record<string, (keyof StreamSchema)[]>;
    };
    write: {
      all: (keyof StreamSchema)[];
      roles: Record<string, (keyof StreamSchema)[]>;
      teams: Record<string, (keyof StreamSchema)[]>;
      users: Record<string, (keyof StreamSchema)[]>;
    };
  };

  @Column({ name: "roles", type: "json" })
  public roles!: Record<
    string,
    {
      teams: string[];
      users: string[];
    }
  >;

  @Column({ length: 200, name: "short_description", nullable: true })
  public shortDescription?: string;

  @Column({ default: () => "CURRENT_TIMESTAMP", name: "updated_at" })
  public updatedAt!: string;

  @Column({ length: 8, name: "user_id" })
  public userId!: string;

  @Column({ name: "variables", type: "json" })
  public variables!: Record<string, unknown>;

  @BeforeUpdate()
  public updateTimestamp(): void {
    this.updatedAt = new Date().toISOString();
  }
}
