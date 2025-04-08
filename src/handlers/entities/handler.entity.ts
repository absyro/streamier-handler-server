import { BeforeUpdate, Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Handler {
  @Column({ length: 64, name: "auth_token", unique: true })
  public authToken!: string;

  @Column({ default: () => "CURRENT_TIMESTAMP", name: "created_at" })
  public createdAt!: Date;

  @Column({ length: 12, name: "icon_id" })
  public iconId!: string;

  @PrimaryColumn({ length: 8, name: "id" })
  public id!: string;

  @Column({ length: 5000, name: "long_description" })
  public longDescription!: string;

  @Column({ length: 100, name: "name" })
  public name!: string;

  @Column({ length: 8, name: "owner_id" })
  public ownerId!: string;

  @Column({ length: 180, name: "short_description" })
  public shortDescription!: string;

  @Column({ default: () => "CURRENT_TIMESTAMP", name: "updated_at" })
  public updatedAt!: Date;

  @BeforeUpdate()
  public updateTimestamp(): void {
    this.updatedAt = new Date();
  }
}
