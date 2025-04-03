import { Entity, PrimaryColumn, Column } from "typeorm";
import { OneToMany } from "typeorm";
import { Stream } from "../../streams/entities/stream.entity";

@Entity()
export class Handler {
  @PrimaryColumn({ type: "varchar", length: 20 })
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 180 })
  shortDescription: string;

  @Column({ length: 1000, nullable: true })
  longDescription: string;

  @Column({ length: 64, unique: true })
  accessToken: string;

  @Column({ type: "varchar", length: 20 })
  ownerId: string;

  @Column({ length: 50, nullable: true })
  iconId: string;

  @Column({ type: "bigint" })
  createdAt: number;

  @Column({ type: "bigint" })
  updatedAt: number;

  @OneToMany(() => Stream, (stream) => stream.handler)
  streams: Stream[];
}
