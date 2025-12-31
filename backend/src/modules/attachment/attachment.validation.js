const { z } = require("zod");

const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format");

exports.taskIdSchema = z.object({
  taskId: objectId,
});

exports.attachmentIdSchema = z.object({
  attachmentId: objectId,
});
