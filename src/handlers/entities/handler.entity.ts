import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";

import { Stream } from "../../streams/entities/stream.entity";

@Entity()
export class Handler {
  @Column({ length: 64, unique: true })
  public accessToken: string;

  @Column({ type: "bigint" })
  public createdAt: number;

  @Column({ length: 50, nullable: true })
  public iconId: string;

  @PrimaryColumn({ length: 20, type: "varchar" })
  public id: string;

  @Column({ length: 1000, nullable: true })
  public longDescription: string;

  @Column({ length: 255 })
  public name: string;

  @Column({ length: 20, type: "varchar" })
  public ownerId: string;

  @Column({ length: 180 })
  public shortDescription: string;

  @OneToMany(() => Stream, (stream) => stream.handler)
  public streams: Stream[];

  @Column({ type: "bigint" })
  public updatedAt: number;
}
