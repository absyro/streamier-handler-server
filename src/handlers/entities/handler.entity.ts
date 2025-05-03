import { ApiProperty } from "@nestjs/swagger";
import { BeforeUpdate, Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Handler {
  @ApiProperty({
    description: "Authentication token used for WebSocket connections",
    example: "abc123def456",
    name: "auth_token",
    readOnly: true,
  })
  @Column({ length: 64, name: "auth_token", unique: true })
  public authToken!: string;

  @ApiProperty({
    description: "Timestamp when the handler was created",
    example: "2024-04-01T12:00:00Z",
    name: "created_at",
    readOnly: true,
  })
  @Column({ default: () => "CURRENT_TIMESTAMP", name: "created_at" })
  public createdAt!: Date;

  @ApiProperty({
    description: "The ID of the handler icon from icons8.com",
    example: "000000",
    maxLength: 12,
    name: "icon_id",
  })
  @Column({ length: 12, name: "icon_id" })
  public iconId!: string;

  @ApiProperty({
    description: "Unique identifier for the handler",
    example: "h1234567",
    maxLength: 8,
    name: "id",
  })
  @PrimaryColumn({ length: 8, name: "id" })
  public id!: string;

  @ApiProperty({
    description: "Detailed description of the handler's functionality.",
    example:
      "This handler is used for developing Discord bots. It allows you to create and manage Discord bots with ease.",
    maxLength: 5000,
    name: "long_description",
  })
  @Column({ length: 5000, name: "long_description" })
  public longDescription!: string;

  @ApiProperty({
    description: "Display name of the handler",
    example: "Discord (Bots)",
    maxLength: 100,
    name: "name",
  })
  @Column({ length: 100, name: "name" })
  public name!: string;

  @ApiProperty({
    description: "Brief description of the handler's purpose",
    example: "Create and manage Discord bots",
    maxLength: 180,
    name: "short_description",
  })
  @Column({ length: 180, name: "short_description" })
  public shortDescription!: string;

  @ApiProperty({
    description: "Timestamp when the handler was last updated",
    example: "2024-04-01T12:30:00Z",
    name: "updated_at",
    readOnly: true,
  })
  @Column({ default: () => "CURRENT_TIMESTAMP", name: "updated_at" })
  public updatedAt!: Date;

  @ApiProperty({
    description: "ID of the user who owns this handler",
    example: "u1234567",
    maxLength: 8,
    name: "user_id",
    readOnly: true,
  })
  @Column({ length: 8, name: "user_id" })
  public userId!: string;

  @BeforeUpdate()
  public updateTimestamp(): void {
    this.updatedAt = new Date();
  }
}
