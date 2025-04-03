import { Entity, PrimaryColumn, Column, ManyToOne } from "typeorm";
import { Handler } from "../../handlers/entities/handler.entity";

@Entity()
export class Stream {
  @PrimaryColumn({ type: "varchar", length: 20 })
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: "jsonb" })
  configuration: Record<string, unknown>;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: "varchar", length: 20 })
  handlerId: string;

  @ManyToOne(() => Handler, (handler) => handler.streams)
  handler: Handler;

  @Column({ type: "bigint" })
  createdAt: number;

  @Column({ type: "bigint" })
  updatedAt: number;
}
