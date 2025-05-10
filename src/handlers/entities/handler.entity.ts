import { ApiProperty } from "@nestjs/swagger";
import { BeforeUpdate, Column, Entity, PrimaryColumn } from "typeorm";

/**
 * Entity class representing a stream handler.
 *
 * Represents a handler that processes and manages streams in the system. Each
 * handler is associated with a user and has various metadata and configuration
 * options.
 *
 * @class Handler
 * @property {string} authToken - Authentication token for WebSocket connections
 * @property {Date} createdAt - Timestamp of handler creation
 * @property {string} iconId - ID of the handler's icon from icons8.com
 * @property {string} id - Unique identifier for the handler
 * @property {string} longDescription - Detailed description of handler
 *   functionality
 * @property {string} name - Display name of the handler
 * @property {string} shortDescription - Brief description of handler purpose
 * @property {string[]} tags - Array of tags associated with the handler
 * @property {Date} updatedAt - Timestamp of last update
 * @property {string} userId - ID of the handler owner
 * @property {boolean} isOnline - Whether the handler is currently online and
 *   connected
 */
@Entity({ name: "handlers" })
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
    description: "Whether the handler is currently online and connected",
    example: false,
    name: "is_online",
    readOnly: true,
  })
  @Column({ default: false, name: "is_online" })
  public isOnline!: boolean;

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
    description: "Tags associated with the handler ",
    example: ["discord", "bot", "automation"],
    maxItems: 10,
    name: "tags",
    type: [String],
  })
  @Column({ name: "tags", type: "simple-array" })
  public tags!: string[];

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

  /**
   * Updates the timestamp when the handler is modified. This method is
   * automatically called before any update operation.
   */
  @BeforeUpdate()
  public updateTimestamp(): void {
    this.updatedAt = new Date();
  }
}
