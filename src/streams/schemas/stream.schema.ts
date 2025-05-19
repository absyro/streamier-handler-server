import { z } from "zod";

export const streamPermissionMatrixSchema = z
  .object({
    all: z
      .array(z.string().max(500).describe("Field identifier"))
      .max(100)
      .describe("Fields accessible to everyone with this permission type"),
    roles: z
      .record(
        z.string().nonempty().max(100).describe("Name of the role"),
        z
          .array(z.string().max(500).describe("Field identifier"))
          .max(100)
          .describe("Fields accessible to this specific role"),
      )
      .describe("Role-based permission exceptions"),
    teams: z
      .record(
        z.string().length(8).describe("8-character team ID"),
        z
          .array(z.string().max(500).describe("Field identifier"))
          .max(100)
          .describe("Fields accessible to this specific team"),
      )
      .describe("Team-based permission exceptions"),
    users: z
      .record(
        z.string().length(8).describe("8-character user ID"),
        z
          .array(z.string().max(500).describe("Field identifier"))
          .max(100)
          .describe("Fields accessible to this specific user"),
      )
      .describe("User-based permission exceptions"),
  })
  .describe("Permission settings for this permission type");

export const streamSchema = z.object({
  configuration: z
    .record(
      z
        .string()
        .nonempty()
        .max(100)
        .describe("The name of the configuration key"),
      z.unknown().describe("The configuration value (can be any type)"),
    )
    .describe("Key-value pairs of stream configuration settings"),
  id: z.string().length(8).describe("The unique 8-character ID of the stream"),
  isActive: z.boolean().describe("Active status of the stream (true/false)"),
  logs: z
    .array(
      z
        .object({
          id: z
            .string()
            .length(8)
            .describe("The unique 8-character ID of the log entry"),
          level: z
            .enum(["debug", "info", "warning", "error"])
            .describe("Severity level of the log entry"),
          message: z
            .string()
            .nonempty()
            .max(1000)
            .describe("The log message content (max 1000 chars)"),
          timestamp: z
            .string()
            .datetime()
            .describe("ISO 8601 timestamp of when the log was created"),
        })
        .describe("A single log entry in the stream's log history"),
    )
    .max(100)
    .describe("Array of log entries (max 100 entries)"),
  name: z
    .string()
    .nonempty()
    .max(100)
    .describe("Display name of the stream (max 100 chars)"),
  nodes: z
    .array(
      z
        .object({
          data: z
            .record(
              z
                .string()
                .nonempty()
                .max(100)
                .describe("The name/key of the data field"),
              z.unknown().describe("The value associated with the data field"),
            )
            .describe("Custom data properties associated with the node"),
          id: z
            .string()
            .nonempty()
            .max(25)
            .describe("Unique identifier for the node (max 25 chars)"),
          name: z
            .string()
            .nonempty()
            .max(100)
            .describe("Display name of the node (max 100 chars)"),
          outputs: z
            .record(
              z
                .string()
                .nonempty()
                .max(100)
                .describe("Name of the output connection point"),
              z
                .array(
                  z
                    .string()
                    .max(25)
                    .describe("Array of node IDs this output connects to"),
                )
                .describe("Destination nodes connected to this output"),
            )
            .describe(
              "Output connections mapping to other nodes in the stream",
            ),
        })
        .describe("A single node in the stream's processing graph"),
    )
    .max(1000)
    .describe("Array of nodes in the stream (max 1000 nodes)")
    .superRefine((nodes, context) => {
      const nodeIdSet = new Set<string>();

      for (const node of nodes) {
        if (nodeIdSet.has(node.id)) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Duplicate ID found: ${node.id}. Node IDs must be unique.`,
            path: [nodes.indexOf(node), "id"],
          });
        }

        nodeIdSet.add(node.id);
      }

      for (const node of nodes) {
        for (const [outputName, nodeIds] of Object.entries(node.outputs)) {
          for (const nodeId of nodeIds) {
            if (!nodeIdSet.has(nodeId)) {
              context.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Output '${outputName}' references non-existent node ID: ${nodeId}`,
                path: [nodes.indexOf(node), "outputs", outputName],
              });
            }
          }
        }
      }
    }),
  permissions: z
    .object({
      read: streamPermissionMatrixSchema.describe("Read permissions"),
      write: streamPermissionMatrixSchema.describe("Write permissions"),
    })
    .describe(
      "Access control configuration organized by permission type (read/write)",
    ),
  roles: z
    .record(
      z.string().nonempty().max(100).describe("Name of the role"),
      z
        .object({
          teams: z
            .array(z.string().length(8).describe("8-character team ID"))
            .max(100)
            .describe("List of teams assigned to this role"),
          users: z
            .array(z.string().length(8).describe("8-character user ID"))
            .max(100)
            .describe("List of users assigned to this role"),
        })
        .describe("Membership configuration for this role"),
    )
    .describe(
      "Role definitions mapping role names to their members (teams and users)",
    ),
  signature: z
    .string()
    .nonempty()
    .max(500)
    .describe(
      "Cryptographic signature verifying the stream's integrity (max 500 chars)",
    ),
  userId: z
    .string()
    .length(8)
    .describe("8-character ID of the user who owns the stream"),
  variables: z
    .record(
      z.string().nonempty().max(100).describe("Name of the variable"),
      z.unknown().describe("Value of the variable (can be any type)"),
    )
    .describe("Key-value pairs of variables available in the stream"),
});
