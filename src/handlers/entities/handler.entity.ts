import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { BeforeUpdate, Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "handlers" })
export class Handler {
  @ApiProperty({
    description: "Authentication token used for WebSocket connections",
    readOnly: true,
  })
  @Column({ length: 64, name: "auth_token", unique: true })
  public authToken!: string;

  @ApiProperty({
    description: "Timestamp when the handler was created",
    readOnly: true,
  })
  @Column({ default: () => "CURRENT_TIMESTAMP", name: "created_at" })
  public createdAt!: Date;

  @ApiPropertyOptional({
    description: "The ID of the handler icon from https://icons8.com",
    maxLength: 12,
  })
  @Column({ length: 12, name: "icon_id", nullable: true })
  public iconId?: string;

  @ApiProperty({
    description: "Unique identifier for the handler",
    maxLength: 8,
  })
  @PrimaryColumn({ length: 8, name: "id" })
  public id!: string;

  @ApiProperty({
    description: "Whether the handler is currently online and connected",
    readOnly: true,
  })
  @Column({ default: false, name: "is_online" })
  public isOnline!: boolean;

  @ApiPropertyOptional({
    description: "Whether the handler should be excluded from search results",
  })
  @Column({ default: false, name: "is_searchable" })
  public isSearchable!: boolean;

  @ApiPropertyOptional({
    description: "Detailed description of the handler's functionality.",
    maxLength: 5000,
  })
  @Column({ length: 5000, name: "long_description", nullable: true })
  public longDescription?: string;

  @ApiProperty({
    description: "Display name of the handler",
    maxLength: 100,
  })
  @Column({ length: 100, name: "name" })
  public name!: string;

  @ApiPropertyOptional({
    description: "Brief description of the handler's purpose",
    maxLength: 180,
  })
  @Column({ length: 180, name: "short_description", nullable: true })
  public shortDescription?: string;

  @ApiPropertyOptional({
    description: "Terms of using this handler",
    maxLength: 5000,
  })
  @Column({ length: 5000, name: "terms", nullable: true })
  public terms?: string;

  @ApiProperty({
    description: "Timestamp when the handler was last updated",
    readOnly: true,
  })
  @Column({ default: () => "CURRENT_TIMESTAMP", name: "updated_at" })
  public updatedAt!: Date;

  @ApiProperty({
    description: "ID of the user who owns this handler",
    maxLength: 8,
    readOnly: true,
  })
  @Column({ length: 8, name: "user_id" })
  public userId!: string;

  @BeforeUpdate()
  public updateTimestamp(): void {
    this.updatedAt = new Date();
  }
}
