import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";

import { Handler } from "../../handlers/entities/handler.entity";

@Entity()
export class Stream {
  @Column({ type: "jsonb" })
  public configuration: Record<string, unknown>;

  @Column({ type: "bigint" })
  public createdAt: number;

  @ManyToOne(() => Handler, (handler) => handler.streams)
  public handler: Handler;

  @Column({ length: 20, type: "varchar" })
  public handlerId: string;

  @PrimaryColumn({ length: 20, type: "varchar" })
  public id: string;

  @Column({ default: true })
  public isActive: boolean;

  @Column({ length: 100 })
  public name: string;

  @Column({ type: "bigint" })
  public updatedAt: number;
}
