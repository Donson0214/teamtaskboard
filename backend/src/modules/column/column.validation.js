const { z } = require("zod");

const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format");

module.exports.createColumnSchema = z.object({
  title: z.string().min(1, "Column title is required"),
  color: z.string().optional(),
  boardId: objectId,
});

module.exports.updateColumnSchema = z.object({
  title: z.string().min(1, "Column title is required"),
  color: z.string().optional(),
});

module.exports.reorderColumnSchema = z.object({
  order: z.number().int().min(0),
});
