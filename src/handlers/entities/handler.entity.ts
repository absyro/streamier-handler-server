import { ApiProperty } from "@nestjs/swagger";
import { BeforeUpdate, Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Handler {
  @ApiProperty({ name: "auth_token" })
  @Column({ length: 64, name: "auth_token", unique: true })
  public authToken!: string;

  @ApiProperty({ name: "created_at" })
  @Column({ default: () => "CURRENT_TIMESTAMP", name: "created_at" })
  public createdAt!: Date;

  @ApiProperty({ name: "icon_id" })
  @Column({ length: 12, name: "icon_id" })
  public iconId!: string;

  @ApiProperty({ name: "id" })
  @PrimaryColumn({ length: 8, name: "id" })
  public id!: string;

  @ApiProperty({ name: "long_description" })
  @Column({ length: 5000, name: "long_description" })
  public longDescription!: string;

  @ApiProperty({ name: "name" })
  @Column({ length: 100, name: "name" })
  public name!: string;

  @ApiProperty({ name: "owner_id" })
  @Column({ length: 8, name: "owner_id" })
  public ownerId!: string;

  @ApiProperty({ name: "short_description" })
  @Column({ length: 180, name: "short_description" })
  public shortDescription!: string;

  @ApiProperty({ name: "updated_at" })
  @Column({ default: () => "CURRENT_TIMESTAMP", name: "updated_at" })
  public updatedAt!: Date;

  @BeforeUpdate()
  public updateTimestamp(): void {
    this.updatedAt = new Date();
  }
}
