const { z } = require("zod");


const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format");


module.exports.createTaskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional().nullable(),
  
  dueDate: z.string().optional().nullable(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  assigneeId: objectId.optional().nullable(),
});


module.exports.updateTaskSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  assigneeId: objectId.optional().nullable(),
});


module.exports.moveTaskSchema = z.object({
  targetColumnId: objectId,
});
