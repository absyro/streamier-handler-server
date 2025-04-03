import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Stream {
  @Column({ type: "jsonb" })
  public configuration: Record<string, unknown>;

  @Column({ type: "bigint" })
  public createdAt: number;

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
