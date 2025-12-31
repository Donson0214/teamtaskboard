const { z } = require("zod");

const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format");

exports.createCommentSchema = z.object({
  content: z.string().min(1, "Comment content is required"),
});

exports.deleteCommentSchema = z.object({
  commentId: objectId,
});
