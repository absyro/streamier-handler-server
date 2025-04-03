import { BeforeUpdate, Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Handler {
  @Column({ length: 64, unique: true })
  public authToken: string;

  @Column({ default: () => "CURRENT_TIMESTAMP", type: "timestamp" })
  public createdAt: Date;

  @Column({ length: 50 })
  public iconId: string;

  @PrimaryColumn({ length: 8, type: "varchar" })
  public id: string;

  @Column({ length: 1000 })
  public longDescription: string;

  @Column({ length: 255 })
  public name: string;

  @Column({ length: 180 })
  public shortDescription: string;

  @Column({ default: () => "CURRENT_TIMESTAMP", type: "timestamp" })
  public updatedAt: Date;

  @Column({ length: 20, type: "varchar" })
  public userId: string;

  @BeforeUpdate()
  public updateTimestamp(): void {
    this.updatedAt = new Date();
  }
}
