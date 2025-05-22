import { BeforeUpdate, Column, Entity, PrimaryColumn } from "typeorm";

import { HandlerSchema } from "../schemas/handler.schema";

@Entity({ name: "handlers" })
export class Handler implements HandlerSchema {
  @Column({ length: 64, name: "auth_token", unique: true })
  public authToken!: string;

  @Column({ default: () => "CURRENT_TIMESTAMP", name: "created_at" })
  public createdAt!: string;

  @Column({ length: 12, name: "icon_id", nullable: true })
  public iconId?: string;

  @PrimaryColumn({ length: 8, name: "id" })
  public id!: string;

  @Column({ default: false, name: "is_active" })
  public isActive!: boolean;

  @Column({ default: false, name: "is_searchable" })
  public isSearchable!: boolean;

  @Column({ length: 5000, name: "long_description", nullable: true })
  public longDescription?: string;

  @Column({ length: 100, name: "name" })
  public name!: string;

  @Column({ length: 200, name: "short_description", nullable: true })
  public shortDescription?: string;

  @Column({ length: 5000, name: "terms", nullable: true })
  public terms?: string;

  @Column({ default: () => "CURRENT_TIMESTAMP", name: "updated_at" })
  public updatedAt!: string;

  @Column({ length: 8, name: "user_id" })
  public userId!: string;

  @BeforeUpdate()
  public updateTimestamp(): void {
    this.updatedAt = new Date().toISOString();
  }
}
