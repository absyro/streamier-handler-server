import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const StreamSchema = z.object({
  configuration: z
    .record(z.unknown())
    .describe("The configuration of the stream"),
  id: z.string().length(8).describe("The ID of the stream"),
  isActive: z.boolean().describe("Whether the stream is active"),
  logs: z
    .array(
      z.object({
        id: z.string().length(8).describe("The ID of the log"),
        level: z
          .enum(["debug", "info", "warning", "error"])
          .describe("The level of the log"),
        message: z
          .string()
          .nonempty()
          .max(1000)
          .describe("The message of the log"),
        timestamp: z.string().datetime().describe("The timestamp of the log"),
      }),
    )
    .max(100)
    .describe("The logs of the stream"),
  name: z.string().nonempty().max(100).describe("The name of the stream"),
  nodes: z
    .array(
      z.object({
        data: z.record(z.unknown()).describe("The data of the node"),
        id: z.string().nonempty().max(25).describe("The ID of the node"),
        name: z.string().nonempty().max(100).describe("The name of the node"),
        outputs: z
          .record(z.array(z.string()))

          .describe("The outputs of the node, connecting to other node IDs"),
      }),
    )
    .max(1000)
    .describe("The nodes of the stream")
    .superRefine((nodes, context) => {
      const nodeIdSet = new Set<string>();

      for (const node of nodes) {
        if (nodeIdSet.has(node.id)) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Duplicate ID found: ${node.id}. IDs must be unique.`,
            path: [nodes.indexOf(node), "id"],
          });
        }

        nodeIdSet.add(node.id);
      }

      for (const node of nodes) {
        for (const nodeIds of Object.values(node.outputs)) {
          for (const nodeId of nodeIds) {
            if (!nodeIdSet.has(nodeId)) {
              context.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Output references non-existent ID: ${nodeId}`,
                path: [nodes.indexOf(node), "outputs"],
              });
            }
          }
        }
      }
    }),
  signature: z
    .string()
    .nonempty()
    .max(500)
    .describe("The signature of the stream"),
  userId: z.string().length(8).describe("The user ID of the stream"),
  variables: z.record(z.unknown()).describe("The variables of the stream"),
  visibility: z
    .enum(["private", "public"])
    .describe("The visibility of the stream"),
});

export class StreamDto extends createZodDto(StreamSchema) {}
